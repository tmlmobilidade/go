/* * */

import { syncCategoryMetrics } from '@/tasks/sync-category-metrics.js';
import { syncPatternHourMetrics } from '@/tasks/sync-pattern-hour-metrics.js';
import { syncProductMetrics } from '@/tasks/sync-product-metrics.js';
import { generatePerformanceSummary } from '@tmlmobilidade/go-performance-pckg-log';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

(async function init() {
	//

	const runOnInterval = async () => {
	//

		const globalTimer = new Timer();

		Logger.title('Starting Metrics Sync');
		Logger.divider();

		try {
			await syncPatternHourMetrics();
			await syncProductMetrics();
			await syncCategoryMetrics();

			generatePerformanceSummary();

			Logger.divider();
			Logger.terminate(`Finished All Metrics Sync (${globalTimer.get()})`);
			Logger.divider();
		}
		catch (error) {
			Logger.error('Failed to sync metrics');
			Logger.error(error);
			Logger.divider();
		}

		setTimeout(runOnInterval, 86_400_000); // 1 day
	};

	runOnInterval();

	//
})();
