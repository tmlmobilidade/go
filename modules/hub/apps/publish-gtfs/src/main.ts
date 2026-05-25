/* * */

import { initExportGtfsContext } from '@/utils/init-contex.js';
import { validatePlan } from '@/validate-plan.js';
import { Dates } from '@tmlmobilidade/dates';
import { Files } from '@tmlmobilidade/files';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs';
import { files, plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Route_Extended, type OperationalDate, validateOperationalDate } from '@tmlmobilidade/types';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { ZipFile } from 'yazl';

/* * */

import { exportAgencyFile } from '@/exports/agency.js';
import { exportCalendarDatesFile } from '@/exports/calendar-dates.js';
import { exportDatesFile } from '@/exports/dates.js';
import { exportFareAttributesFile } from '@/exports/fare-attributes.js';
import { exportFareRulesFile } from '@/exports/fare-rules.js';
import { exportFeedInfoFile } from '@/exports/feed-info.js';
import { exportMunicipalitiesFile } from '@/exports/municipalities.js';
import { exportPeriodsFile } from '@/exports/periods.js';
import { exportPlansFile } from '@/exports/plans.js';
import { exportRoutesFile } from '@/exports/routes.js';
import { exportShapesFile } from '@/exports/shapes.js';
import { exportStopTimesFile } from '@/exports/stop-times.js';
import { exportStopsFile } from '@/exports/stops.js';
import { exportTripsFile } from '@/exports/trips.js';

/* * */

let PREVIOUS_PLANS_LIST_HASH: null | string = null;

/* * */

export async function main() {
	//

	const globalTimer = new Timer();

	//
	// Initialize context for the export process.

	const context = initExportGtfsContext();

	//
	// Prepare the working directory.

	try {
		fs.rmSync(context.workdir.path, { force: true, recursive: true });
		fs.mkdirSync(context.workdir.path, { recursive: true });
		Logger.success(`Prepared working directory at "${context.workdir.path}".`, 1);
	} catch (error) {
		Logger.error(`Error preparing workdir path "${context.workdir.path}".`, error);
		process.exit(1);
	}

	//
	// Setup the necessary variables for the export process.

	let farthestDateFound: OperationalDate;

	const referencedAgencyIds = new Set<string>();
	const routesMarkedForFinalExport: Record<string, GTFS_Route_Extended> = {};

	const currentOperationalDate = Dates.now('Europe/Lisbon').operational_date;

	//
	// Retrieve all Plans from the database
	// and iterate on each one.

	const allPlansData = await plans.findMany({}, { sort: { 'gtfs_feed_info.feed_start_date': 1 } });

	if (allPlansData.length === 0) return Logger.terminate('No Plans found. Exiting...');

	Logger.info(`Found ${allPlansData.length} Plans to process...`);

	//
	// Hash the allPlansData response and check if it differs
	// from the last processed hash stored in memory. This way,
	// if no Plans were changed/added/removed since the last export,
	// we can skip the entire export process.

	const currentPlansListHash = crypto
		.createHash('sha1')
		.update(JSON.stringify(allPlansData.map(plan => plan.hash)))
		.digest('hex');

	if (PREVIOUS_PLANS_LIST_HASH === currentPlansListHash) {
		return Logger.terminate('No changes detected in Plans list since last export. Skipping this run...');
	}

	PREVIOUS_PLANS_LIST_HASH = currentPlansListHash;

	//
	// Mark as plans as 'waiting' in the database.

	for (const planData of allPlansData) {
		await plans.updateById(planData._id, { apps: { ...planData.apps, merger: { last_hash: null, status: 'waiting', timestamp: Dates.now('Europe/Lisbon').unix_timestamp } } }, { forceIfLocked: true });
	}

	//
	// For each plan, validate it and import its GTFS into
	// a database and cut it according to the plan's feed_info dates.

	for (const [planIndex, planData] of allPlansData.entries()) {
		try {
			//

			const planTimer = new Timer();

			Logger.info(`[${planIndex + 1}/${allPlansData.length}] - Agency ${planData.gtfs_agency.agency_id} - Plan ${planData._id}`);

			//
			// Validate the Plan data before processing.
			// If the plan is invalid, skip to the next one
			// and mark it as 'skipped' in the database.
			// Otherwise, mark it as 'processing'.

			const isValidPlan = validatePlan(planData);

			if (!isValidPlan) {
				await plans.updateById(planData._id, { apps: { ...planData.apps, merger: { last_hash: null, status: 'skipped', timestamp: Dates.now('Europe/Lisbon').unix_timestamp } } }, { forceIfLocked: true });
				Logger.info(`Skipped plan ${planData._id} due to validation errors.`);
				continue;
			}

			await plans.updateById(planData._id, { apps: { ...planData.apps, merger: { last_hash: null, status: 'processing', timestamp: Dates.now('Europe/Lisbon').unix_timestamp } } }, { forceIfLocked: true });

			//
			// Get the operation file URL

			const operationFileUrl = await files.getFileUrl({ file_id: planData.operation_file_id });

			//
			// Find out if this plan is a currently active plan.
			// Active plans are those whose feed_info dates
			// encompass the current date, and should be cut only at the end,
			// not at the start, as to be able to provide a full year of data.

			let thisIsAnActivePlan = false;

			const importConfig: ImportGtfsToDatabaseConfig = {
				source: {
					url: operationFileUrl,
				},
				time_range: {
					date_range: {
						end: planData.gtfs_feed_info.feed_end_date,
						start: planData.gtfs_feed_info.feed_start_date,
					},
				},
			};

			if (currentOperationalDate >= planData.gtfs_feed_info.feed_start_date && currentOperationalDate <= planData.gtfs_feed_info.feed_end_date) {
				// If the plan is currently active, set the start date
				// to a far past date to be able to provide a full year of data.
				importConfig.time_range.date_range.start = validateOperationalDate('20010101');
				// Update the flag
				thisIsAnActivePlan = true;
			}

			//
			// Import the GTFS into a SQLite database.
			// Let the function handle the parsing and cutting,
			// and return table instances with processed data.

			const importTimer = new Timer();

			const importedGtfsSql = await importGtfsToDatabase(importConfig);

			Logger.success(`Imported plan ${planData._id} in ${importTimer.get()}.`);

			//
			// Setup the export config and export the GTFS files
			// into a temporary working directory.

			const exportTimer = new Timer();

			await exportTripsFile(planData, importedGtfsSql, context);
			await exportStopTimesFile(planData, importedGtfsSql, context);
			await exportShapesFile(planData, importedGtfsSql, context);
			await exportCalendarDatesFile(planData, importedGtfsSql, context);

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

			await exportPlansFile(planData.gtfs_agency.agency_id, planData._id, planData.gtfs_feed_info.feed_start_date, planData.gtfs_feed_info.feed_end_date, context);

			//
			// Mark the plan as complete in the database.

			await plans.updateById(planData._id, { apps: { ...planData.apps, merger: { last_hash: null, status: 'complete', timestamp: Dates.now('Europe/Lisbon').unix_timestamp } } }, { forceIfLocked: true });

			Logger.success(`Processed plan ${planData._id} in ${planTimer.get()}.`);

			//
			// Force the closure of the SQLite database connection to release resources.
			// Since SQLite sets up memory using C-level allocations, it is not possible
			// to rely on garbage collection alone to free up memory in a timely manner.

			importedGtfsSql._db.close();

			Logger.divider();

			//
		} catch (error) {
			await plans.updateById(planData._id,	{ apps: { ...planData.apps, merger: { last_hash: null, status: 'error', timestamp: Dates.now('Europe/Lisbon').unix_timestamp } } }, { forceIfLocked: true });
			Logger.error(`Error processing plan ${planData._id}`, error);
			Logger.divider();
		}
	}

	//
	// Export GTFS files from the merged dataset

	await exportStopsFile(context);
	await exportDatesFile(context);
	await exportPeriodsFile(context);
	await exportMunicipalitiesFile(context);
	await exportFareAttributesFile(Array.from(referencedAgencyIds), context);
	await exportFareRulesFile(Object.keys(routesMarkedForFinalExport), context);
	await exportRoutesFile(Object.values(routesMarkedForFinalExport), context);
	await exportAgencyFile(Array.from(referencedAgencyIds), context);
	await exportFeedInfoFile(currentOperationalDate, farthestDateFound, context);

	//
	// Zip the exported GTFS files into a single archive.
	// YAZL is used here for its focus on performance and low memory usage.

	const zipTimer = new Timer();

	const outputZip = new ZipFile();

	await new Promise<void>((resolve) => {
		// Read the working directory contents
		const workdirDirContents = fs.readdirSync(context.workdir.path, { withFileTypes: true });
		// Add each file to the zip
		workdirDirContents.forEach(outputDirFile => outputZip.addFile(`${context.workdir.path}/${outputDirFile.name}`, outputDirFile.name));
		// Setup a write stream to the final zip file
		outputZip.outputStream
			.pipe(fs.createWriteStream(`${context.workdir.path}/${context.run_id}.zip`))
			.on('close', resolve);
		// Finalize the zip creation, which triggers
		// the piping and writing process.
		outputZip.end();
	});

	Logger.success(`Zipped GTFS export in ${zipTimer.get()}.`);

	//
	// Upload the GTFS zip file to the Files collection,
	// which handles storage and retrieval.

	const fileStream = fs.createReadStream(`${context.workdir.path}/${context.run_id}.zip`);

	await files.upload(fileStream, {
		_id: 'gtfs-latest',
		created_by: 'system',
		name: `${context.run_id}.zip`,
		resource_id: 'gtfs-latest',
		scope: 'plans',
		size: fs.statSync(`${context.workdir.path}/${context.run_id}.zip`).size,
		type: Files.getFileExtensionFromMimeType(Files.getFileExtension(`${context.run_id}.zip`)),
		updated_by: 'system',
	}, { override: true });

	//
	// Finalize the export process

	Logger.terminate(`Run took ${globalTimer.get()}`);

	//
}
