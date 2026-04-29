/* * */

import { etaDailyRidesWaypointsSnapped, etaNodeTravelTimesAggregation, etaNodeTravelTimesSamples, queryFromFile } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { applyEtaDdl, pipelinePath } from '@tmlmobilidade/go-eta-bootstrap';
import { syncDailyRides } from '@tmlmobilidade/go-eta-sync-daily-rides';
import { syncShapeNodes } from '@tmlmobilidade/go-eta-sync-shape-nodes';
import { syncVehicleEvents } from '@tmlmobilidade/go-eta-sync-vehicle-events';
import { Filter } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Ride } from '@tmlmobilidade/types';

/* * */

const DAILY_RUN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const HISTORICAL_RUN_INTERVAL_MS = 60_000 * 60 * 24; // 24 hours
const VEHICLE_EVENTS_DAYS_CUTOFF = 7; // 7 days
const AGENCY_IDS = ['41', '42', '43', '44'];
const SHAPE_NODE_CHUNK_LENGTH = 25; // meters
// ! Development only: restrict to a hand-picked set of lines
const DEV_LINE_IDS = [2652, 2708, 2711, 2713, 2722, 2725, 2728, 2729, 2730, 2731, 2734];

/* * */

function getDailyDateRange(): { end: Dates, start: Dates } {
	const start = Dates.now('Europe/Lisbon').startOf('day').set({ hour: 4, minute: 0, second: 0 });
	const end = start.plus({ days: 1 });
	return { end, start };
}

function getHistoricalDateRange(): { end: Dates, start: Dates } {
	const now = Dates.now('Europe/Lisbon');
	const start = now.minus({ days: VEHICLE_EVENTS_DAYS_CUTOFF }).set({ hour: 4, minute: 0, second: 0 });
	const endCutoff = now.set({ hour: 4, minute: 0, second: 0 });
	const end = endCutoff.unix_timestamp > now.unix_timestamp
		? now.minus({ days: 1 }).set({ hour: 4, minute: 0, second: 0 })
		: endCutoff;
	return { end, start };
}

async function runDailyPipeline(): Promise<void> {
	const timer = new Timer();
	const { end, start } = getDailyDateRange();
	Logger.info(`Running daily pipeline for date range: ${start.iso} → ${end.iso}`);

	const ridesQuery: Filter<Ride> = {
		agency_id: { $in: AGENCY_IDS },
		line_id: { $in: DEV_LINE_IDS },
		start_time_scheduled: { $gte: start.unix_timestamp, $lt: end.unix_timestamp },
	};

	const { ridesCount, waypointsCount } = await syncDailyRides({ ridesQuery });
	Logger.success(`Daily sync completed: ${ridesCount} rides and ${waypointsCount} waypoints in ${timer.get()}`);

	Logger.info('Running snap-waypoints pipeline...');
	const snapClient = await etaDailyRidesWaypointsSnapped.getClient();
	await etaDailyRidesWaypointsSnapped.clearData();
	await queryFromFile(snapClient, pipelinePath('snap-waypoints'));
	Logger.success('Snap-waypoints pipeline completed');
}

async function runHistoricalPipeline(): Promise<void> {
	const timer = new Timer();
	const { end, start } = getHistoricalDateRange();
	Logger.info(`Running historical pipeline for date range: ${start.iso} → ${end.iso}`);

	const ridesQuery: Filter<Ride> = {
		agency_id: { $in: AGENCY_IDS },
		end_time_observed: { $ne: null },
		line_id: { $in: DEV_LINE_IDS },
		start_time_observed: { $ne: null },
		start_time_scheduled: { $gte: start.unix_timestamp, $lt: end.unix_timestamp },
	};

	const [
		{ eventsProcessed, ridesProcessed },
		{ shapeNodesProcessed },
	] = await Promise.all([
		syncVehicleEvents({ ridesQuery }),
		syncShapeNodes({ chunkLength: SHAPE_NODE_CHUNK_LENGTH, ridesQuery }),
	]);

	Logger.success(`Historical sync completed: ${ridesProcessed} rides, ${eventsProcessed} events in ${timer.get()}`);
	Logger.success(`Historical sync completed: ${shapeNodesProcessed} shape nodes`);

	Logger.info('Running transformation pipeline...');
	const samplesClient = await etaNodeTravelTimesSamples.getClient();
	await etaNodeTravelTimesSamples.clearData();
	await queryFromFile(samplesClient, pipelinePath('transformation'));
	Logger.success('Transformation pipeline completed');

	Logger.info('Running aggregation pipeline...');
	const aggClient = await etaNodeTravelTimesAggregation.getClient();
	await etaNodeTravelTimesAggregation.clearData();
	await queryFromFile(aggClient, pipelinePath('aggregation'));
	Logger.success('Aggregation pipeline completed');
}

function scheduleTask(taskName: string, intervalMs: number, task: () => Promise<void>): void {
	const runOnInterval = async () => {
		const timer = new Timer();
		try {
			await task();
			Logger.success(`${taskName} run completed in ${timer.get()}`);
		} catch (error) {
			Logger.error(`${taskName} run failed`);
			const pipelineError = error instanceof Error ? error : new Error(String(error));
			Logger.error(pipelineError.message, pipelineError);
		} finally {
			setTimeout(runOnInterval, intervalMs);
		}
	};

	void runOnInterval();
}

/* * */

(async function run() {
	Logger.init();

	// Apply DDL once before schedulers start (idempotent, IF NOT EXISTS).
	await applyEtaDdl();

	scheduleTask('Daily pipeline', DAILY_RUN_INTERVAL_MS, runDailyPipeline);
	scheduleTask('Historical pipeline', HISTORICAL_RUN_INTERVAL_MS, runHistoricalPipeline);
})();
