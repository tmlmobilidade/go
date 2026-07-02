/* * */

import { transformReferenceTypeAgencyIntoJson } from '@/transform/json/reference-types/agency.js';
import { transformReferenceTypeLinesIntoJson } from '@/transform/json/reference-types/lines.js';
import { transformReferenceTypeRidesIntoJson } from '@/transform/json/reference-types/rides.js';
import { transformReferenceTypeStopsIntoJson } from '@/transform/json/reference-types/stops.js';
import { apiCache } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { type HubAlert, HubAlertSchema } from '@tmlmobilidade/go-types-public-info';
import { alerts, files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type AlertReference } from '@tmlmobilidade/types';

/* * */

export async function publishJsonFeed() {
	//

	Logger.title('Starting build of JSON feed...');

	const globalTimer = new Timer();

	//
	// Retrieve active alerts from the database

	const findResult = await alerts.findMany(
		{
			$and: [
				{
					$or: [
						{ publish_end_date: { $gte: Dates.now('Europe/Lisbon').unix_timestamp } },
						{ publish_end_date: null },
						{ publish_end_date: undefined },
						{ publish_end_date: { $exists: false } },
					],
					publish_start_date: { $lte: Dates.now('Europe/Lisbon').unix_timestamp },
					publish_status: 'published',
				},
			],
		},
		{
			sort: { created_at: -1 },
		},
	);

	Logger.info({ message: `Retrieved ${findResult.length} active alerts...` });

	//
	// Transform alerts into GTFS-RT feed entities

	const result: HubAlert[] = [];

	for (const alertData of findResult) {
		try {
			//

			//
			// Get the image URL if it exists

			let imageUrl: string | undefined;

			if (alertData.file_id) {
				// Get the associated file data to prepare the image value
				const fileData = await files.findById(alertData.file_id);
				if (fileData?.url && fileData?.type) {
					imageUrl = fileData.url;
				}
			}

			//
			// Transform the reference IDs into public IDs

			let transformedReferences: AlertReference[] = [];

			if (alertData.reference_type === 'agency') {
				const result = await transformReferenceTypeAgencyIntoJson(alertData);
				if (result) transformedReferences = result;
			}

			if (alertData.reference_type === 'lines') {
				const result = await transformReferenceTypeLinesIntoJson(alertData);
				if (result) transformedReferences = result;
			}

			if (alertData.reference_type === 'rides') {
				const result = await transformReferenceTypeRidesIntoJson(alertData);
				if (result) transformedReferences = result;
			}

			if (alertData.reference_type === 'stops') {
				const result = await transformReferenceTypeStopsIntoJson(alertData);
				if (result) transformedReferences = result;
			}

			if (!transformedReferences) {
				Logger.error({ message: `[Alert ID: ${alertData._id}] Alert transformed references are missing.` });
				return;
			}

			const transformedAlert: HubAlert = {
				_id: alertData._id,
				active_period_end_date: alertData.active_period_end_date,
				active_period_start_date: alertData.active_period_start_date,
				agency_id: alertData.agency_id,
				cause: alertData.cause,
				coordinates: alertData.coordinates,
				description: alertData.description,
				effect: alertData.effect,
				image_url: imageUrl,
				info_url: alertData.info_url,
				municipality_ids: alertData.municipality_ids,
				reference_type: alertData.reference_type,
				references: transformedReferences,
				title: alertData.title,
			};

			const parsedAlert = HubAlertSchema.parse(transformedAlert);

			result.push(parsedAlert);
		} catch (error) {
			Logger.error({ error, message: `Error processing alert with ID ${alertData._id}:` });
		}
	}

	Logger.info({ message: `Transformed ${result.length} alerts into JSON feed entities (${globalTimer.get()})` });

	//
	// Save the result in API Cache

	await apiCache.set('hub:v1:alerts:published:json', JSON.stringify(result));

	Logger.success(`Finished publishing JSON feed (${globalTimer.get()})`);

	//
};
