/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { alerts, files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type Alert } from '@tmlmobilidade/types';

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

	Logger.info(`Retrieved ${findResult.length} active alerts...`);

	//
	// Transform alerts into GTFS-RT feed entities

	const result: (Alert & { image_url?: string })[] = [];

	for (const alertData of findResult) {
		//

		let imageUrl: string | undefined;

		if (alertData.file_id) {
			// Get the associated file data to prepare the image value
			const fileData = await files.findById(alertData.file_id);
			if (fileData?.url && fileData?.type) {
				imageUrl = fileData.url;
			}
		}

		result.push({
			...alertData,
			image_url: imageUrl,
		});
	}

	Logger.info(`Transformed ${result.length} alerts into JSON feed entities (${globalTimer.get()})`);

	//
	// Save the result in API Cache

	await apiCache.set('hub:alerts:published:json', JSON.stringify(result));

	Logger.success(`Finished publishing JSON feed (${globalTimer.get()})`);

	//
};
