/* * */

import { refreshPassengerDemandHistory } from '@/tasks/refresh-passenger-demand-history.js';
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

	// Separately refresh the seven-day window of the daily dimensional history.
	// This task enforces its own five-minute cadence even though this worker runs every 30 seconds.
	await refreshPassengerDemandHistory();

	//

	Logger.divider();
	Logger.terminate(`Finished Realtime Metrics Sync (${globalTimer.get()})`);
	Logger.divider();

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s' });
