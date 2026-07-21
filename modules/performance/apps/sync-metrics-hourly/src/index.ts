/* * */

import { syncAgencyMetrics } from '@/tasks/sync-agency-metrics.js';
import { syncLineMetrics } from '@/tasks/sync-line-metrics.js';
import { syncPatternMetrics } from '@/tasks/sync-pattern-metrics.js';
import { MetricSyncRunner } from '@/utils/run-metric.js';
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
		Logger.error({ error, message: 'Error initializing Sentry Performance Sync Metrics Hourly' });
	}

	const globalTimer = new Timer();
	const runner = new MetricSyncRunner('Metrics sync');

	Logger.title('Starting Metrics Sync');
	Logger.divider();

	await runner.run('agency_metrics', syncAgencyMetrics);
	await runner.run('line_metrics', syncLineMetrics);
	await runner.run('pattern_metrics', syncPatternMetrics);

	generatePerformanceSummary();

	Logger.divider();

	runner.finish({ successMessage: `Finished All Metrics Sync (${globalTimer.get()})` });

	Logger.divider();

	//
}

/* * */

await runOnInterval(main, { intervalMs: '1h' });
