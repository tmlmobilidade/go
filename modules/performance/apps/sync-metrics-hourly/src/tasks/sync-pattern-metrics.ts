/* * */

import { syncDemandByPatternByDay } from '@/syncs/demand_by_pattern/by_day.js';
import { syncDemandByPatternByMonth } from '@/syncs/demand_by_pattern/by_month.js';
import { syncDemandByPatternByYear } from '@/syncs/demand_by_pattern/by_year.js';
import { MetricSyncRunner } from '@/utils/run-metric.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncPatternMetrics = async (): Promise<void> => {
	const timer = new Timer();
	const runner = new MetricSyncRunner('Pattern metrics');

	Logger.title('Starting Pattern Demand Metrics Sync');
	Logger.divider();

	await runner.run('demand_by_pattern_by_day', syncDemandByPatternByDay);
	await runner.run('demand_by_pattern_by_month', syncDemandByPatternByMonth);
	await runner.run('demand_by_pattern_by_year', syncDemandByPatternByYear);

	runner.finish({ successMessage: `Finished Pattern Demand Metrics Sync (${timer.get()})` });
};
