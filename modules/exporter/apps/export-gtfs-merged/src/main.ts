/* * */

import { type MergedGtfsExportConfig } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { Files } from '@tmlmobilidade/files';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs';
import { files, plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Route_Extended, type OperationalDate, validateOperationalDate } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import fs from 'node:fs';
import { ZipFile } from 'yazl';

/* * */

import { exportAgencyFile } from '@/exports/agency.js';
import { exportCalendarDatesRows } from '@/exports/calendar-dates.js';
import { exportDatesFile } from '@/exports/dates.js';
import { exportFareAttributesFile } from '@/exports/fare-attributes.js';
import { exportFareRulesFile } from '@/exports/fare-rules.js';
import { exportFeedInfoFile } from '@/exports/feed-info.js';
import { exportMunicipalitiesFile } from '@/exports/municipalities.js';
import { exportPeriodsFile } from '@/exports/periods.js';
import { exportPlansFile } from '@/exports/plans.js';
import { exportRoutesFile } from '@/exports/routes.js';
import { exportShapesRows } from '@/exports/shapes.js';
import { exportStopTimesRows } from '@/exports/stop-times.js';
import { exportStopsFile } from '@/exports/stops.js';
import { exportTripsRows } from '@/exports/trips.js';

/* * */

export async function main() {
	//

	const globalTimer = new Timer();

	//
	// Setup the export config variables

	const exportVersion = Dates.now('Europe/Lisbon').toFormat('yyyyLLdd-HHmm-ss');

	const exportConfig: MergedGtfsExportConfig = {
		version: exportVersion,
		workdir: `/tmp/${exportVersion}`,
		writers: {
			agency: new CsvWriter('agency.txt', `/tmp/${exportVersion}/agency.txt`, { batch_size: 10000 }),
			calendar_dates: new CsvWriter('calendar_dates.txt', `/tmp/${exportVersion}/calendar_dates.txt`, { batch_size: 10000 }),
			dates: new CsvWriter('dates.txt', `/tmp/${exportVersion}/dates.txt`, { batch_size: 10000 }),
			fare_attributes: new CsvWriter('fare_attributes.txt', `/tmp/${exportVersion}/fare_attributes.txt`, { batch_size: 10000 }),
			fare_rules: new CsvWriter('fare_rules.txt', `/tmp/${exportVersion}/fare_rules.txt`, { batch_size: 10000 }),
			feed_info: new CsvWriter('feed_info.txt', `/tmp/${exportVersion}/feed_info.txt`, { batch_size: 10000 }),
			municipalities: new CsvWriter('municipalities.txt', `/tmp/${exportVersion}/municipalities.txt`, { batch_size: 10000 }),
			periods: new CsvWriter('periods.txt', `/tmp/${exportVersion}/periods.txt`, { batch_size: 10000 }),
			plans: new CsvWriter('plans.txt', `/tmp/${exportVersion}/plans.txt`, { batch_size: 10000 }),
			routes: new CsvWriter('routes.txt', `/tmp/${exportVersion}/routes.txt`, { batch_size: 10000 }),
			shapes: new CsvWriter('shapes.txt', `/tmp/${exportVersion}/shapes.txt`, { batch_size: 10000 }),
			stop_times: new CsvWriter('stop_times.txt', `/tmp/${exportVersion}/stop_times.txt`, { batch_size: 10000 }),
			stops: new CsvWriter('stops.txt', `/tmp/${exportVersion}/stops.txt`, { batch_size: 10000 }),
			trips: new CsvWriter('trips.txt', `/tmp/${exportVersion}/trips.txt`, { batch_size: 10000 }),
		},
	};

	//
	// Setup variables to keep track of which entities
	// are being included in the export.

	let farthestDateFound: OperationalDate;

	const referencedAgencyIds = new Set<string>();
	const routesMarkedForFinalExport: Record<string, GTFS_Route_Extended> = {};

	//
	// Get all plans that are active and upcoming.
	// For this regional merge export plans are cut according
	// to their feed_info dates and stiched back together into
	// a single GTFS dataset, based on the current date.

	const currentOperationalDate = Dates.now('Europe/Lisbon').operational_date;

	const allActiveAndUpcomingPlans = await plans.findMany({
		'gtfs_agency.agency_id': { $in: ['41', '42', '43', '44'] },
		'gtfs_feed_info.feed_end_date': { $gte: currentOperationalDate },
	});

	if (!allActiveAndUpcomingPlans.length) {
		Logger.info('No active or upcoming plans found. Exiting...');
		return;
	}

	Logger.info(`Found ${allActiveAndUpcomingPlans.length} active and upcoming plans to process...`);

	//
	// For each plan, validate it and import its GTFS into
	// a database and cut it according to the plan's feed_info dates.

	for (const planData of allActiveAndUpcomingPlans) {
		//

		const planTimer = new Timer();

		//
		// Skip if this archive has no associated operation
		// plan file or no feed_info start and end dates.

		if (!planData.operation_file_id) {
			Logger.error(`Plan ${planData._id} has no associated operation file. Skipping...`);
			continue;
		}

		if (!planData.gtfs_feed_info?.feed_start_date) {
			Logger.error(`Plan ${planData._id} has no feed_info start date. Skipping...`);
			continue;
		}

		if (!planData.gtfs_feed_info?.feed_end_date) {
			Logger.error(`Plan ${planData._id} has no feed_info end date. Skipping...`);
			continue;
		}

		//
		// Find out if this plan is a currently active plan.
		// Active plans are those whose feed_info dates
		// encompass the current date, and should be cut only at the end,
		// not at the start, as to be able to provide a full year of data.

		let thisIsAnActivePlan = false;

		const importConfig: ImportGtfsToDatabaseConfig = {
			date_range: {
				end: planData.gtfs_feed_info.feed_end_date,
				start: planData.gtfs_feed_info.feed_start_date,
			},
		};

		if (currentOperationalDate >= planData.gtfs_feed_info.feed_start_date && currentOperationalDate <= planData.gtfs_feed_info.feed_end_date) {
			// If the plan is currently active, set the start date
			// to a far past date to be able to provide a full year of data.
			importConfig.date_range.start = validateOperationalDate('20010101');
			// Update the flag
			thisIsAnActivePlan = true;
		}

		//
		// Import the GTFS into a SQLite database.
		// Let the function handle the parsing and cutting,
		// and return table instances with processed data.

		const importTimer = new Timer();

		const importedGtfsSql = await importGtfsToDatabase(planData, importConfig);

		Logger.success(`Imported plan ${planData._id} in ${importTimer.get()}.`);

		//
		// Setup the export config and export the GTFS files
		// into a temporary working directory.

		const exportTimer = new Timer();

		await exportTripsRows(planData, importedGtfsSql, exportConfig);
		await exportStopTimesRows(planData, importedGtfsSql, exportConfig);
		await exportShapesRows(planData, importedGtfsSql, exportConfig);
		await exportCalendarDatesRows(planData, importedGtfsSql, exportConfig);

		Logger.success(`Exported plan ${planData._id} files in ${exportTimer.get()}.`);

		//
		// Routes behave a little differently as only one version of each will be exported:
		// 1. If the route exists in an active plan, use that version.
		// 2. Otherwise, use the most recent version available.
		// Unlike other files, we do not add Plan ID modifier to the route_id. This is a deliberate
		// stylistic choice to keep route_ids consistent across plans, making it easier to reference
		// and manage routes without relying on plan-scoped identifiers. Instead, we track inclusion
		// at the export scope — each route can only be exported once, even though it may appear in
		// multiple plans, and could have different attributes in each plan.
		// This block only determines which routes should be exported; no files are written here.

		for await (const routeItem of importedGtfsSql.routes.stream()) {
			const routeData: GTFS_Route_Extended = routeItem;
			if (thisIsAnActivePlan || !routesMarkedForFinalExport[routeData.route_id]) {
				routesMarkedForFinalExport[routeData.route_id] = routeData;
			}
		}

		Logger.info(`Added route references for plan ${planData._id}.`);

		//
		// Add the plan's referenced agency ID and farthest
		// feed end date to the global variables for later export.

		referencedAgencyIds.add(planData.gtfs_agency.agency_id);

		farthestDateFound = !farthestDateFound || planData.gtfs_feed_info.feed_end_date > farthestDateFound
			? planData.gtfs_feed_info.feed_end_date
			: farthestDateFound;

		//
		// Finally, write the plan entry into the plans.txt file.

		await exportPlansFile(planData.gtfs_agency.agency_id, planData._id, planData.gtfs_feed_info.feed_start_date, planData.gtfs_feed_info.feed_end_date, exportConfig);

		Logger.success(`Processed plan ${planData._id} in ${planTimer.get()}.`);

		//
	}

	//
	// Export GTFS files from the merged dataset

	await exportStopsFile(exportConfig);
	await exportDatesFile(exportConfig);
	await exportPeriodsFile(exportConfig);
	await exportMunicipalitiesFile(exportConfig);
	await exportFareAttributesFile(exportConfig);
	await exportFareRulesFile(Object.keys(routesMarkedForFinalExport), exportConfig);
	await exportRoutesFile(Object.values(routesMarkedForFinalExport), exportConfig);
	await exportAgencyFile(Array.from(referencedAgencyIds), exportConfig);
	await exportFeedInfoFile(currentOperationalDate, farthestDateFound, exportConfig);

	//
	// Zip the exported GTFS files into a single archive

	const zipTimer = new Timer();

	const outputZip = new ZipFile();

	await new Promise<void>((resolve) => {
		const workdirDirContents = fs.readdirSync(exportConfig.workdir, { withFileTypes: true });
		workdirDirContents.forEach((outputDirFile) => {
			outputZip.addFile(`${exportConfig.workdir}/${outputDirFile.name}`, outputDirFile.name);
		});
		outputZip.outputStream
			.pipe(fs.createWriteStream(`${exportConfig.workdir}/${exportConfig.version}.zip`))
			.on('close', resolve);
		outputZip.end();
	});

	Logger.success(`Zipped GTFS export in ${zipTimer.get()}.`);

	//
	// Upload the GTFS zip file to the S3 files service

	const fileStream = fs.createReadStream(`${exportConfig.workdir}/${exportConfig.version}.zip`, 'utf-8');

	await files.upload(fileStream, {
		_id: 'gtfs-merged-latest',
		created_by: 'system',
		name: `${exportConfig.version}.zip`,
		resource_id: 'gtfs-merged',
		scope: 'exports',
		size: fs.statSync(`${exportConfig.workdir}/${exportConfig.version}.zip`).size,
		type: Files.getFileExtensionFromMimeType(Files.getFileExtension(`${exportConfig.version}.zip`)),
		updated_by: 'system',
	}, { override: true });

	//
	// Finalize the export process

	Logger.terminate(`Run took ${globalTimer.get()}`);

	//
}
