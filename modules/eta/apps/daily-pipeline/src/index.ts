/* * */

import { clickhouseService } from '@tmlmobilidade/clickhouse';
import { Dates } from '@tmlmobilidade/dates';
import { syncDailyRides } from '@tmlmobilidade/go-eta-sync-daily-rides';
import { Filter } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Ride } from '@tmlmobilidade/types';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

/* * */

const RUN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const AGENCY_IDS = ['41', '42', '43', '44'];
const BATCH_SIZE = 100_000;

/* * */

function getDateRange(): { end: Dates, start: Dates } {
	//

	const start = Dates.now('Europe/Lisbon').startOf('day').set({ hour: 4, minute: 0, second: 0 });
	const end = start.plus({ days: 1 });

	return { end, start };
}

async function main(): Promise<void> {
	//

	Logger.init();
	const timer = new Timer();

	//
	// Setup Clickhouse
	const client = await clickhouseService.getClient();
	//
	// Get Date Range
	const { end, start } = getDateRange();

	Logger.info(`Running daily pipeline for date range: ${start.iso} → ${end.iso}`);

	//
	// Setup Rides Query
	const ridesQuery: Filter<Ride> = {
		agency_id: { $in: AGENCY_IDS },
		line_id: { $in: [2652, 2708, 2711, 2713, 2722, 2725, 2728, 2729, 2730, 2731, 2734] }, // ! Development only
		start_time_observed: { $eq: null },
		start_time_scheduled: { $gte: start.unix_timestamp, $lt: end.unix_timestamp },
	};

	//
	// 1. Sync Vehicle Events
	const [
		{ ridesProcessed },
	] = await Promise.all([
		syncDailyRides({ batchSize: BATCH_SIZE, client, ridesQuery }),
	]);

	Logger.success(`Sync completed: ${ridesProcessed} rides in ${timer.get()}`);

	const trasnformationPipelineFilePath = path.join(__dirname, '..', 'sql', 'transformation-pipeline.sql');
	await clickhouseService.queryFromFile(trasnformationPipelineFilePath);
	Logger.success('Transformation pipeline completed');

	Logger.terminate(`Terminated in ${timer.get()}`);
}

/* * */

(async function run() {
	const runOnInterval = async () => {
		await main();
		setTimeout(runOnInterval, RUN_INTERVAL_MS);
	};
	runOnInterval();
})();
