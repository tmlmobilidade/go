/* * */

import { refreshPassengerDemandDaily } from '@/tasks/refresh-passenger-demand-daily.js';
import { refreshPassengerDemandFiveMinute } from '@/tasks/refresh-passenger-demand-five-minute.js';
import { refreshRidePerformance } from '@/tasks/refresh-ride-performance.js';
import { syncPassengerDemandMetrics } from '@/tasks/sync-passenger-demand.js';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'sync-metrics-realtime', message: 'Sentry Performance Sync Metrics Realtime initialized', module: 'performance', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Performance Sync Metrics Realtime' });
	}

	const globalTimer = new Timer();

	Logger.title(`Starting Realtime Metrics Sync`);
	Logger.divider();

	//

	// Keep the minute-grain agency facts and current videowall projection in sync.
	await syncPassengerDemandMetrics();

	// Publish the current operational date at the canonical five-minute grain.
	await refreshPassengerDemandFiveMinute();

	// Publish the current ride-grain fact on the same closed five-minute cadence.
	await refreshRidePerformance();

	// Separately refresh the seven-day window of the daily dimensional history.
	// This task enforces its own five-minute cadence even though this worker runs every 30 seconds.
	await refreshPassengerDemandDaily();

	//

	Logger.divider();
	Logger.terminate(`Finished Realtime Metrics Sync (${globalTimer.get()})`);
	Logger.divider();

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s' });
