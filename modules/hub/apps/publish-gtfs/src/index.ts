/* * */

import { getQualifiedRouteId } from '@tmlmobilidade/go-hub-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type GtfsRoutes } from '@tmlmobilidade/go-types-gtfs';
import { OperationalDateInt, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Files } from '@tmlmobilidade/go-utils-files';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { type ImportGtfsConfig, importGtfsToDatabase } from '@tmlmobilidade/import-gtfs';
import fs from 'node:fs';
import { ZipFile } from 'yazl';

import { exportAgencyFile } from './tasks/export-agency.js';
import { exportCalendarDatesFile } from './tasks/export-calendar-dates.js';
import { exportFeedInfoFile } from './tasks/export-feed-info.js';
import { exportPlansFile } from './tasks/export-plans.js';
import { exportRoutesFile } from './tasks/export-routes.js';
import { exportShapesFile } from './tasks/export-shapes.js';
import { exportStopTimesFile } from './tasks/export-stop-times.js';
import { exportStopsFile } from './tasks/export-stops.js';
import { exportTripsFile } from './tasks/export-trips.js';
import { getActivePlans } from './utils/get-active-plans.js';
import { initExportGtfsContext } from './utils/init-context.js';

/* * */

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	//
	// Initialize context for the export process.

	const context = initExportGtfsContext();

	//
	// Setup the necessary variables for the export process.

	let farthestDateFound: null | OperationalDateInt = null;

	const referencedAgencyIds = new Set<string>();
	const routesMarkedForFinalExport: Record<string, GtfsRoutes> = {};

	const currentDate = Dates.now('Europe/Lisbon').operational_date_int;

	//
	// Retrieve all Plans from the database
	// and iterate on each one.

	const plansCollection = await goDb.operation.plans.getCollection();

	//
	// Get the list of plans to export and mark them
	// as 'waiting' in the database, and all the others
	// as 'skipped' in the same operation.

	const activePlans = await getActivePlans();

	if (!activePlans?.length) {
		return Logger.terminate('No active Plans found. Exiting...');
	}

	await plansCollection.updateMany({ _id: { $in: activePlans.map(plan => plan._id) } }, {
		$set: {
			'apps.hub_publish_gtfs.message': null,
			'apps.hub_publish_gtfs.status': 'waiting',
			'apps.hub_publish_gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds,
		},
	});

	await plansCollection.updateMany({ _id: { $nin: activePlans.map(plan => plan._id) } }, {
		$set: {
			'apps.hub_publish_gtfs.message': null,
			'apps.hub_publish_gtfs.status': 'skipped',
			'apps.hub_publish_gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds,
		},
	});

	//
	// For each plan, validate it and import its GTFS into
	// a database and cut it according to the plan's feed_info dates.

	for (const [planIndex, planData] of activePlans.entries()) {
		try {
			//

			const planTimer = new Timer();

			Logger.info({ message: `[${planIndex + 1}/${activePlans.length}] - Agency ${planData.agency_id} - Plan ${planData._id}` });

			await plansCollection.updateOne({ _id: { $eq: planData._id } }, { $set: { 'apps.hub_publish_gtfs.last_hash': null, 'apps.hub_publish_gtfs.status': 'processing', 'apps.hub_publish_gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds } });

			//
			// Get the operation GTFS normalized attachment URL

			if (!planData.attachments.operation_gtfs_normalized) {
				throw new Error(`Plan ${planData._id} has no operation GTFS normalized attachment.`);
			}

			const operationGtfsNormalizedAttachmentUrl = await storageProvider.getSignedUrl({ fileId: planData.attachments.operation_gtfs_normalized });

			//
			// Find out if this plan is a currently active plan.
			// Active plans are those whose feed_info dates
			// encompass the current date, and should be cut only at the end,
			// not at the start, as to be able to provide a full year of data.

			let thisIsAnActivePlan = false;

			const importConfig = {
				source: {
					url: operationGtfsNormalizedAttachmentUrl,
				},
				sqlite_config: {
					memory: true,
				},
				time_range: {
					date_range: {
						end: planData.active_until,
						start: planData.active_from,
					},
				},
			} satisfies ImportGtfsConfig;

			if (currentDate >= planData.active_from && currentDate <= planData.active_until) {
				// If the plan is currently active, set the start date
				// to a far past date to be able to provide a full year of data.
				importConfig.time_range.date_range.start = OperationalDateIntSchema.parse('20010101');
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

			await exportTripsFile(context, planData, importedGtfsSql);
			await exportStopTimesFile(context, planData, importedGtfsSql);
			await exportShapesFile(context, planData, importedGtfsSql);
			await exportCalendarDatesFile(context, planData, importedGtfsSql);

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
				const routeData: GtfsRoutes = routeItem;
				const publicRouteId = getQualifiedRouteId(planData.agency_id, routeData.route_id);
				if (thisIsAnActivePlan || !routesMarkedForFinalExport[publicRouteId]) {
					routesMarkedForFinalExport[publicRouteId] = { ...routeData, agency_id: planData.agency_id };
				}
			}

			Logger.info({ message: `Added route references for plan ${planData._id}.` });

			//
			// Add the plan's referenced agency ID and farthest
			// feed end date to the global variables for later export.

			referencedAgencyIds.add(planData.agency_id);

			farthestDateFound = !farthestDateFound || planData.active_until > farthestDateFound
				? planData.active_until
				: farthestDateFound;

			//
			// Finally, write the plan entry into the plans.txt file.

			await exportPlansFile(context, planData);

			//
			// Mark the plan as complete in the database.

			await plansCollection.updateOne({ _id: { $eq: planData._id } }, { $set: { 'apps.hub_publish_gtfs.last_hash': null, 'apps.hub_publish_gtfs.status': 'complete', 'apps.hub_publish_gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds } });

			Logger.success(`Processed plan ${planData._id} in ${planTimer.get()}.`);

			//
			// Force the closure of the SQLite database connection to release resources.
			// Since SQLite sets up memory using C-level allocations, it is not possible
			// to rely on garbage collection alone to free up memory in a timely manner.

			importedGtfsSql._db.cleanup();

			Logger.divider();

			//
		} catch (error) {
			await plansCollection.updateOne({ _id: { $eq: planData._id } }, { $set: { 'apps.hub_publish_gtfs.message': error.message, 'apps.hub_publish_gtfs.status': 'error', 'apps.hub_publish_gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds } });
			Logger.error({ error, message: `Error processing plan ${planData._id}` });
			Logger.divider();
		}
	}

	//
	// Export GTFS files from the merged dataset

	await exportRoutesFile(context, Object.values(routesMarkedForFinalExport));
	await exportStopsFile(context, Array.from(referencedAgencyIds));
	await exportAgencyFile(context, Array.from(referencedAgencyIds));
	await exportFeedInfoFile(context, currentDate, farthestDateFound ?? currentDate);

	//
	// Zip the exported GTFS files into a single archive.
	// YAZL is used here for its focus on performance and low memory usage.

	const zipTimer = new Timer();

	Logger.info({ message: 'Zipping GTFS export...' });

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

	Logger.info({ message: 'Uploading GTFS zip file to Files collection...' });

	const fileStream = fs.createReadStream(`${context.workdir.path}/${context.run_id}.zip`);

	await storageProvider.replace(fileStream, {
		_id: 'gtfs-latest',
		created_by: 'system',
		name: `${context.run_id}.zip`,
		resource_id: 'gtfs-latest',
		scope: 'hub',
		size: fs.statSync(`${context.workdir.path}/${context.run_id}.zip`).size,
		type: Files.getFileExtensionFromMimeType(Files.getFileExtension(`${context.run_id}.zip`)),
		updated_by: 'system',
	});

	//
	// Finalize the export process

	try {
		fs.rmSync(context.workdir.path, { force: true, recursive: true });
	} catch (error) {
		Logger.error({ error, message: `Error removing export workdir "${context.workdir.path}".` });
	}

	Logger.terminate(`Run took ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '10s', throwOnError: false });
