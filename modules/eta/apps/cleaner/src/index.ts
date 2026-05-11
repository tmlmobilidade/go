/* * */

import { AppConfig } from '@/lib/config.js';
import { cleanupCurrentRides } from '@/tasks/cleanup-current-rides.js';
import { cleanupCurrentVehicleEvents } from '@/tasks/cleanup-current-vehicle-events.js';
import { cleanupCurrentWaypoints } from '@/tasks/cleanup-current-waypoints.js';
import { GOClickHouseClient } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

export async function main() {
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

	Logger.success(`Cleaner completed in ${globalTimer.get()} seconds`);
}

/* * */

runOnInterval(main, { intervalMs: AppConfig.interval });
