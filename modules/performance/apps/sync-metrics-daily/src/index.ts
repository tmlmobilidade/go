/* * */

import { syncCategoryMetrics } from '@/tasks/sync-category-metrics.js';
import { syncPassengerImpactMetrics } from '@/tasks/sync-passenger-impact.js';
import { syncPatternHourMetrics } from '@/tasks/sync-pattern-hour-metrics.js';
import { syncProductMetrics } from '@/tasks/sync-product-metrics.js';
import { generatePerformanceSummary } from '@tmlmobilidade/go-performance-pckg-log';
import { initSentry, Logger } from '@tmlmobilidade/logger-logger-backend';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	//
	// Initialize Sentry

	try {
		await initSentry();
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Performance Sync Metrics Daily' });
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
		Logger.error({ message: 'Failed to sync metrics' });
		Logger.error(error);
		Logger.divider();
	}

	//
}

/* * */

await runOnInterval(main, { intervalMs: '24h' });
