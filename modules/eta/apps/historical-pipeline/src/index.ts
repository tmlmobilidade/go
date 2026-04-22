/* * */

import { etaNodeTravelTimesAggregation, etaNodeTravelTimesSamples, queryFromFile } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { syncShapeNodes } from '@tmlmobilidade/go-eta-sync-shape-nodes';
import { syncVehicleEvents } from '@tmlmobilidade/go-eta-sync-vehicle-events';
import { Filter } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Ride } from '@tmlmobilidade/types';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

/* * */

const RUN_INTERVAL_MS = 60_000 * 60 * 24; // 24 hours
const VEHICLE_EVENTS_DAYS_CUTOFF = 7; // 7 days
const AGENCY_IDS = ['41', '42', '43', '44'];
const SHAPE_NODE_CHUNK_LENGTH = 25; // meters

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
	// Get Date Range
	const { end, start } = getDateRange();

	Logger.info(`Running historical pipeline for date range: ${start.iso} → ${end.iso}`);

	//
	// Setup Rides Query
	const ridesQuery: Filter<Ride> = {
		agency_id: { $in: AGENCY_IDS },
		end_time_observed: { $ne: null },
		line_id: { $in: [2652, 2708, 2711, 2713, 2722, 2725, 2728, 2729, 2730, 2731, 2734] }, // ! Development only
		start_time_observed: { $ne: null },
		start_time_scheduled: { $gte: start.unix_timestamp, $lt: end.unix_timestamp },
	};

	//
	// 1. Sync Vehicle Events
	const [
		{ eventsProcessed, ridesProcessed },
		{ shapeNodesProcessed },
	] = await Promise.all([
		syncVehicleEvents({ ridesQuery }),
		syncShapeNodes({ chunkLength: SHAPE_NODE_CHUNK_LENGTH, ridesQuery }),
	]);

	Logger.success(`Sync completed: ${ridesProcessed} rides, ${eventsProcessed} events in ${timer.get()}`);
	Logger.success(`Sync completed: ${shapeNodesProcessed} shape nodes`);

	//
	// 4. Run Transformation Pipeline
	Logger.info('Running transformation pipeline...');

	const client = await etaNodeTravelTimesSamples.getClient();
	await etaNodeTravelTimesSamples.clearData();

	const transformationPipelineFilePath = path.join(__dirname, '..', 'sql', 'transformation-pipeline.sql');
	await queryFromFile(client, transformationPipelineFilePath);

	Logger.success('Transformation pipeline completed');

	//
	// 5. Run Aggregation Pipeline
	Logger.info('Running aggregation pipeline...');

	const clientAggregation = await etaNodeTravelTimesAggregation.getClient();
	await etaNodeTravelTimesAggregation.clearData();

	const aggregationPipelineFilePath = path.join(__dirname, '..', 'sql', 'aggregation-pipeline.sql');
	await queryFromFile(clientAggregation, aggregationPipelineFilePath);

	Logger.success('Aggregation pipeline completed');

	//

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
