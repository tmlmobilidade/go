/* * */

import { syncCategoryMetrics } from '@/tasks/sync-category-metrics.js';
import { syncPassengerImpactMetrics } from '@/tasks/sync-passenger-impact.js';
import { syncPatternHourMetrics } from '@/tasks/sync-pattern-hour-metrics.js';
import { syncProductMetrics } from '@/tasks/sync-product-metrics.js';
import { generatePerformanceSummary } from '@tmlmobilidade/go-performance-pckg-log';
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
		Logger.startNodeLogs({ app: 'sync-metrics-daily', message: 'Sentry Performance Sync Metrics Daily initialized', module: 'performance', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Performance Sync Metrics Daily', error);
	}

	const globalTimer = new Timer();

	Logger.title('Starting Metrics Sync');
	Logger.divider();

	try {
		await syncPatternHourMetrics();
		await syncProductMetrics();
		await syncCategoryMetrics();
		await syncPassengerImpactMetrics();

		generatePerformanceSummary();

		Logger.divider();
		Logger.terminate(`Finished All Metrics Sync (${globalTimer.get()})`);
		Logger.divider();
	} catch (error) {
		Logger.error('Failed to sync metrics');
		Logger.error(error);
		Logger.divider();
	}

	//
}

/* * */

await runOnInterval(main, { intervalMs: '24h' });
