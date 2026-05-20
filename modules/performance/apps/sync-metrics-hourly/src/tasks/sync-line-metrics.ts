/* * */

import { syncDemandByLineByDay } from '@/syncs/demand_by_line/by_day.js';
import { syncDemandByLineByMonth } from '@/syncs/demand_by_line/by_month.js';
import { syncDemandByLineByYear } from '@/syncs/demand_by_line/by_year.js';
import { computeMeanDemandByLineByMonth } from '@/syncs/demand_by_line/mean_by_month.js';
import { computeTop30DayPerformanceByLine } from '@/syncs/demand_by_line/top_30day_performance.js';
import { computeTopMeanDemandByLineByMonth } from '@/syncs/demand_by_line/top_mean_by_month.js';
import { MetricSyncRunner } from '@/utils/run-metric.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncLineMetrics = async (): Promise<void> => {
	const timer = new Timer();
	const runner = new MetricSyncRunner('Line metrics');

	Logger.title('Starting Line Demand Metrics Sync');
	Logger.divider();

	await runner.run('demand_by_line_by_day', syncDemandByLineByDay);
	await runner.run('demand_by_line_by_month', syncDemandByLineByMonth);
	await runner.run('demand_by_line_by_year', syncDemandByLineByYear);

	await runner.runParallel([
		{ fn: computeMeanDemandByLineByMonth, name: 'mean_demand_by_line_by_month' },
		{ fn: computeTopMeanDemandByLineByMonth, name: 'top_mean_demand_by_line_by_month' },
		{ fn: computeTop30DayPerformanceByLine, name: 'top_lines_30day_performance' },
	]);

	runner.finish({ successMessage: `Finished Line Demand Metrics Sync (${timer.get()})` });
};
