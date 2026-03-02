/* * */

import { syncCategoryMetrics } from '@/tasks/sync-category-metrics.js';
import { syncPassengerImpactMetrics } from '@/tasks/sync-passenger-impact.js';
import { syncPatternHourMetrics } from '@/tasks/sync-pattern-hour-metrics.js';
import { syncProductMetrics } from '@/tasks/sync-product-metrics.js';
import { generatePerformanceSummary } from '@tmlmobilidade/go-performance-pckg-log';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	//
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

runOnInterval(main, 86_400_000); // 1 day
