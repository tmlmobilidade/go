/* * */

import { syncPassengerDemandMetrics } from '@/tasks/sync-passenger-demand.js';
import { runDemandByAgencyByOperationalDate } from '@tmlmobilidade/go-performance-pckg-scripts';
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

	await syncPassengerDemandMetrics();
	// await runDemandByAgencyByOperationalDate('full');

	//

	Logger.divider();
	Logger.terminate(`Finished Realtime Metrics Sync (${globalTimer.get()})`);
	Logger.divider();

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s' });
