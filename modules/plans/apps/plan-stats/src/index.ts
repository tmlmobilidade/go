import { importGtfsToDatabase } from '@tmlmobilidade/import-gtfs';
import { plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	const allPlansData = await plans.findMany({ _id: '6KLCD' }, { sort: { 'gtfs_feed_info.feed_start_date': 1 } });

	if (allPlansData.length === 0) return Logger.terminate('No Plans found. Exiting...');

	Logger.info(`Found ${allPlansData.length} Plans to process...`);

	for (const plan of allPlansData) {
		const gtfs = await importGtfsToDatabase(plan);

		gtfs.trips.query('SELECT COUNT(*) AS total_trips FROM trips');
	}
}

/* * */

await runOnInterval(main, { intervalMs: '5m' });
