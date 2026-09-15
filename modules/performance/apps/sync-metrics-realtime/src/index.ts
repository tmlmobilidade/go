/* * */

import { runDemandByAgencyByOperationalDate } from '@tmlmobilidade/go-performance-pckg-scripts';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { syncRealtimeDemand } from './tasks/sync-realtime-demand.js';
import { syncRealtimeServiceCompliance } from './tasks/sync-service-compliance.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'sync-metrics-realtime', message: 'Sentry Performance Sync Metrics Realtime initialized', module: 'performance', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Performance Sync Metrics Realtime' });
}

async function main() {
	//

	const globalTimer = new Timer();

	Logger.title('Starting Realtime Metrics Sync');
	Logger.divider();

	//
	// Sync the realtime metrics

	await syncRealtimeDemand();

	await syncRealtimeServiceCompliance();

	await runDemandByAgencyByOperationalDate('full');

	//

	Logger.divider();
	Logger.terminate(`Finished Realtime Metrics Sync (${globalTimer.get()})`);
	Logger.divider();

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s' });
