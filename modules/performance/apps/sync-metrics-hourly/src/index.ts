/* * */

import { syncAgencyMetrics } from '@/tasks/sync-agency-metrics.js';
import { syncLineMetrics } from '@/tasks/sync-line-metrics.js';
import { syncPatternMetrics } from '@/tasks/sync-pattern-metrics.js';
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
		await syncAgencyMetrics();
		await syncLineMetrics();
		await syncPatternMetrics();

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

await runOnInterval(main, { intervalMs: '1h' });
