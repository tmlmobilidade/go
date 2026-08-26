/* * */

import { rebuildPassengerDemandDaily } from '@/tasks/rebuild-passenger-demand-daily.js';
import { reconcileDailyPassengerDemandFiveMinute } from '@/tasks/reconcile-passenger-demand-five-minute.js';
import { reconcileDailyRidePerformance } from '@/tasks/reconcile-ride-performance.js';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'sync-metrics-daily', message: 'Sentry Performance Sync Metrics Daily initialized', module: 'performance', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Performance Sync Metrics Daily' });
	}

	const globalTimer = new Timer();

	Logger.title('Starting Metrics Sync');
	Logger.divider();

	try {
		await rebuildPassengerDemandDaily();
		await reconcileDailyPassengerDemandFiveMinute();
		await reconcileDailyRidePerformance();

		Logger.divider();
		Logger.terminate(`Finished All Metrics Sync (${globalTimer.get()})`);
		Logger.divider();
	} catch (error) {
		Logger.error({ message: 'Failed to sync metrics' });
		Logger.error(error);
		Logger.divider();
	}

	//
}

/* * */

await runOnInterval(main, { intervalMs: '24h' });
