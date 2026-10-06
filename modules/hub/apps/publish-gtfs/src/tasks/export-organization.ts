/* * */

import { getOrganizationGtfsResourceId, getQualifiedRouteId } from '@tmlmobilidade/go-hub-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type Organization } from '@tmlmobilidade/go-types-core';
import { type GtfsRoutes } from '@tmlmobilidade/go-types-gtfs';
import { HubV1GtfsAgencySchema, HubV1GtfsCalendarDatesSchema, HubV1GtfsPlansSchema, HubV1GtfsRoutesSchema, HubV1GtfsShapesSchema, HubV1GtfsStopsSchema, HubV1GtfsStopTimesSchema, HubV1GtfsTripsSchema } from '@tmlmobilidade/go-types-hub';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { OperationalDateInt, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { type ImportGtfsConfig, importGtfsToDatabase } from '@tmlmobilidade/import-gtfs';
import fs from 'node:fs';
import { ZipFile } from 'yazl';

import { initExportGtfsContext } from '../utils/init-context.js';
import { exportAgencyFile } from './export-agency.js';
import { exportCalendarDatesFile } from './export-calendar-dates.js';
import { exportFeedInfoFile } from './export-feed-info.js';
import { exportPlansFile } from './export-plans.js';
import { exportRoutesFile } from './export-routes.js';
import { exportShapesFile } from './export-shapes.js';
import { exportStopTimesFile } from './export-stop-times.js';
import { exportStopsFile } from './export-stops.js';
import { exportTripsFile } from './export-trips.js';

/* * */

export async function exportOrganizationGtfs(organization: Organization, activePlans: Plan[]) {
	//

	//
	// Measure this organization export

	const globalTimer = new Timer();
	const plansCollection = await goDb.operation.plans.getCollection();

	//
	// Initialize context for the export process.

	const context = initExportGtfsContext();

	//
	// Setup the necessary variables for the export process.

	let farthestDateFound: null | OperationalDateInt = null;

	const referencedAgencyIds = new Set<string>();
	const routesMarkedForFinalExport: Record<string, GtfsRoutes> = {};

	const currentDate = Dates.now('Europe/Lisbon').operational_date_int;

	try {
		//
		// Mark this organization's plans as waiting.

		await plansCollection.updateMany({ _id: { $in: activePlans.map(plan => plan._id) } }, {
			$set: {
				'apps.hub_publish_gtfs.message': null,
				'apps.hub_publish_gtfs.status': 'waiting',
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

				await plansCollection.updateOne({ _id: { $eq: planData._id } }, { $set: { 'apps.hub_publish_gtfs.status': 'processing', 'apps.hub_publish_gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds } });

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

				try {
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
					// Log the completed plan export.

					Logger.success(`Processed plan ${planData._id} in ${planTimer.get()}.`);
				} finally {
					importedGtfsSql._db.cleanup();
				}

				Logger.divider();

				//
			} catch (error) {
				await plansCollection.updateOne({ _id: { $eq: planData._id } }, { $set: { 'apps.hub_publish_gtfs.message': error.message, 'apps.hub_publish_gtfs.status': 'error', 'apps.hub_publish_gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds } });
				Logger.error({ error, message: `Error processing plan ${planData._id}` });
				throw error;
			}
		}

		//
		// Export GTFS files from the merged dataset

		await exportRoutesFile(context, Object.values(routesMarkedForFinalExport));
		await exportStopsFile(context, Array.from(referencedAgencyIds));
		await exportAgencyFile(context, Array.from(referencedAgencyIds));
		await exportFeedInfoFile(context, currentDate, farthestDateFound ?? currentDate);

		// Keep empty snapshots importable and replace previously published service.
		const fileSchemas = {
			agency: HubV1GtfsAgencySchema,
			calendar_dates: HubV1GtfsCalendarDatesSchema,
			plans: HubV1GtfsPlansSchema,
			routes: HubV1GtfsRoutesSchema,
			shapes: HubV1GtfsShapesSchema,
			stop_times: HubV1GtfsStopTimesSchema,
			stops: HubV1GtfsStopsSchema,
			trips: HubV1GtfsTripsSchema,
		};
		for (const [name, schema] of Object.entries(fileSchemas)) {
			const filePath = `${context.workdir.path}/${name}.txt`;
			if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, `${Object.keys(schema.shape).join(',')}\n`);
		}

		//
		// Zip the exported GTFS files into a single archive.
		// YAZL is used here for its focus on performance and low memory usage.

		const zipTimer = new Timer();

		Logger.info({ message: 'Zipping GTFS export...' });

		const outputZip = new ZipFile();

		await new Promise<void>((resolve, reject) => {
			// Read the working directory contents
			const workdirDirContents = fs.readdirSync(context.workdir.path, { withFileTypes: true });
			// Add each file to the zip
			workdirDirContents.forEach(outputDirFile => outputZip.addFile(`${context.workdir.path}/${outputDirFile.name}`, outputDirFile.name));
			// Setup a write stream to the final zip file
			outputZip.on('error', reject);
			outputZip.outputStream
				.on('error', reject)
				.pipe(fs.createWriteStream(`${context.workdir.path}/${context.run_id}.zip`))
				.on('error', reject)
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

		const resourceId = getOrganizationGtfsResourceId(organization._id);

		await storageProvider.replace(fileStream, {
			_id: resourceId,
			created_by: 'system',
			name: `${resourceId}.zip`,
			resource_id: resourceId,
			scope: 'hub',
			size: fs.statSync(`${context.workdir.path}/${context.run_id}.zip`).size,
			type: 'application/zip',
			updated_by: 'system',
		});

		//
		// Mark the plans complete after the feed is published.

		await plansCollection.updateMany({ _id: { $in: activePlans.map(plan => plan._id) } }, {
			$set: {
				'apps.hub_publish_gtfs.message': null,
				'apps.hub_publish_gtfs.status': 'complete',
				'apps.hub_publish_gtfs.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds,
			},
		});

		Logger.success(`Published ${resourceId} in ${globalTimer.get()}.`);
	} finally {
		context.workdir.remove();
	}
}
