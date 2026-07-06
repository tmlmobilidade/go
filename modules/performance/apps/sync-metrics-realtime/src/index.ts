/* * */

import { syncRealtimeDemand } from '@/tasks/sync-realtime-demand.js';
import { syncRealtimeServiceCompliance } from '@/tasks/sync-service-compliance.js';
// import { generatePerformanceSummary } from '@tmlmobilidade/go-performance-pckg-log';
import { runDemandByAgencyByOperationalDate } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
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

	await syncRealtimeDemand();

	await syncRealtimeServiceCompliance();

	await runDemandByAgencyByOperationalDate('full');

	//

	// generatePerformanceSummary();

	//

	Logger.divider();
	Logger.terminate(`Finished Realtime Metrics Sync (${globalTimer.get()})`);
	Logger.divider();

	//
}

/* * */

await runOnInterval(main, { intervalMs: '30s' });
