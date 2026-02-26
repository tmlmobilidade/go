/* * */

import { createClient } from '@clickhouse/client';
import { Dates } from '@tmlmobilidade/dates';
import { syncShapeNodes } from '@tmlmobilidade/go-eta-sync-shape-nodes';
import { syncVehicleEvents } from '@tmlmobilidade/go-eta-sync-vehicle-events';
import { Filter } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Ride } from '@tmlmobilidade/types';

/* * */

const RUN_INTERVAL_MS = 60_000 * 60 * 24; // 24 hours
const RIDES_BATCH_SIZE = 30_000;
const VEHICLE_EVENTS_DAYS_CUTOFF = 1;
const AGENCY_IDS = ['41', '42', '43', '44'];
const SHAPE_NODE_CHUNK_LENGTH = 25; // meters
const BATCH_SIZE = 100_000;

/* * */

function getDateRange(): { end: Dates, start: Dates } {
	//

	const now = Dates.now('Europe/Lisbon');
	const start = now.minus({ days: VEHICLE_EVENTS_DAYS_CUTOFF }).set({ hour: 4, minute: 0, second: 0 });
	const endCutoff = now.set({ hour: 4, minute: 0, second: 0 });
	const end = endCutoff.unix_timestamp > now.unix_timestamp
		? now.minus({ days: 1 }).set({ hour: 4, minute: 0, second: 0 })
		: endCutoff;

	//

	return { end, start };
}

async function main(): Promise<void> {
	//

	Logger.init();
	const timer = new Timer();

	//
	// Setup Clickhouse
	const client = createClient({
		database: process.env.CLICKHOUSE_DATABASE,
		password: process.env.CLICKHOUSE_PASSWORD,
		url: `${process.env.CLICKHOUSE_TLS === 'true' ? 'https' : 'http'}://${process.env.CLICKHOUSE_HOST}:8123`,
		username: process.env.CLICKHOUSE_USERNAME,
	});

	await client.command({ query: 'DROP TABLE IF EXISTS vehicle_events' });

	//
	// Get Date Range
	const { end, start } = getDateRange();

	//
	// Setup Rides Query
	const ridesQuery: Filter<Ride> = {

		start_time_observed: { $ne: null },
		start_time_scheduled: { $gte: start.unix_timestamp, $lt: end.unix_timestamp },
	};

	//
	// Sync Vehicle Events
	const { eventsProcessed, ridesProcessed } = await syncVehicleEvents({
		batchSize: BATCH_SIZE,
		client,
		endDate: end.unix_timestamp,
		startDate: start.unix_timestamp,
	});
	Logger.success(`Sync completed: ${ridesProcessed} rides, ${eventsProcessed} events in ${timer.get()}`);

	//
	// Sync Shape Nodes
	const { shapeNodesProcessed } = await syncShapeNodes({
		batchSize: BATCH_SIZE,
		client,
		endDate: end.unix_timestamp,
		startDate: start.unix_timestamp,
	});
	Logger.success(`Sync completed: ${shapeNodesProcessed} shape nodes`);

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
