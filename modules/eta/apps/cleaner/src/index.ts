/* * */

import { AppConfig } from '@/lib/config.js';
import { cleanupCurrentRides } from '@/tasks/cleanup-current-rides.js';
import { cleanupCurrentVehicleEvents } from '@/tasks/cleanup-current-vehicle-events.js';
import { cleanupCurrentWaypoints } from '@/tasks/cleanup-current-waypoints.js';
import { cleanupHistoricalNodeTravelTimesAggregation } from '@/tasks/cleanup-historical-node-travel-times-aggregation.js';
import { cleanupHistoricalNodeTravelTimes } from '@/tasks/cleanup-historical-node-travel-times.js';
import { cleanupHistoricalRides } from '@/tasks/cleanup-historical-rides.js';
import { cleanupHistoricalVehicleEvents } from '@/tasks/cleanup-historical-vehicle-events.js';
import { GOClickHouseClient } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

import { fetchHistoricalRidesForDayIndex } from './tasks/fetch-historical-rides-for-day-index.js';

/* * */

export async function main() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'cleaner', message: 'Sentry ETA Cleaner initialized', module: 'eta', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry ETA Cleaner', error);
	}

	//
	// Initialize the logger

	Logger.init();
	const globalTimer = new Timer();

	//
	// Initialize the ClickHouse client

	const clickhouseClient = await GOClickHouseClient.getClient();

	//
	// Cleanup current rides

	if (AppConfig.pipelineSteps.cleanupCurrentRides) {
		await cleanupCurrentRides(clickhouseClient);
	}

	//
	// Cleanup current waypoints

	if (AppConfig.pipelineSteps.cleanupCurrentWaypoints) {
		await cleanupCurrentWaypoints(clickhouseClient);
	}

	//
	// Cleanup current vehicle events

	if (AppConfig.pipelineSteps.cleanupCurrentVehicleEvents) {
		await cleanupCurrentVehicleEvents(clickhouseClient);
	}

	//
	// Cleanup historical rides

	if (AppConfig.pipelineSteps.cleanupHistoricalRides) {
		//

		Logger.info(`Getting historical rides for date range: ${Dates.now('Europe/Lisbon').minus({ days: AppConfig.historicalDataDaysBack }).iso} → ${Dates.now('Europe/Lisbon').iso}`);

		// Fetch the same per-day windows the loader inserts so we can
		// determine which hist_rides are still considered in-window.
		const historicalRidesPromises = [];
		for (let index = 0; index < AppConfig.historicalDataDaysBack; index++) {
			historicalRidesPromises.push(fetchHistoricalRidesForDayIndex({}, index));
		}
		const historicalRidesByDay = await Promise.all(historicalRidesPromises);

		const keepRideIds = new Set<string>();
		for (const dayRides of historicalRidesByDay) {
			for (const ride of dayRides) {
				keepRideIds.add(ride._id);
			}
		}
		Logger.info(`Found ${keepRideIds.size} historical rides in current window`);

		await cleanupHistoricalRides(clickhouseClient, Array.from(keepRideIds));
	}

	//
	// Cleanup historical vehicle events

	if (AppConfig.pipelineSteps.cleanupHistoricalVehicleEvents) {
		await cleanupHistoricalVehicleEvents(clickhouseClient);
	}

	//
	// Cleanup historical node travel times

	if (AppConfig.pipelineSteps.cleanupHistoricalNodeTravelTimes) {
		await cleanupHistoricalNodeTravelTimes(clickhouseClient);
	}

	//
	// Cleanup historical node travel times aggregation

	if (AppConfig.pipelineSteps.cleanupHistoricalNodeTravelTimesAggregation) {
		await cleanupHistoricalNodeTravelTimesAggregation(clickhouseClient);
	}

	Logger.success(`Cleaner completed in ${globalTimer.get()} seconds`);
}

/* * */

runOnInterval(main, { intervalMs: AppConfig.interval });
