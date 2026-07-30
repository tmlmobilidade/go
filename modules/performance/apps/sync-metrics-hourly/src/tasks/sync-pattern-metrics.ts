/* * */

import { syncDemandByPatternByDay } from '@/syncs/demand_by_pattern/by_day.js';
import { syncDemandByPatternByMonth } from '@/syncs/demand_by_pattern/by_month.js';
import { syncDemandByPatternByYear } from '@/syncs/demand_by_pattern/by_year.js';
import { syncSupplyByPatternByDay } from '@/syncs/supply_by_pattern/by_day.js';
import { syncSupplyByPatternByMonth } from '@/syncs/supply_by_pattern/by_month.js';
import { syncSupplyByPatternByYear } from '@/syncs/supply_by_pattern/by_year.js';
import { syncSupplyByPatternHourByDay } from '@/syncs/supply_by_pattern_hour/by_day.js';
import { syncSupplyByPatternHourByMonth } from '@/syncs/supply_by_pattern_hour/by_month.js';
import { syncSupplyByPatternHourByYear } from '@/syncs/supply_by_pattern_hour/by_year.js';
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

	await runner.run('supply_by_pattern_by_day', syncSupplyByPatternByDay);
	await runner.run('supply_by_pattern_by_month', syncSupplyByPatternByMonth);
	await runner.run('supply_by_pattern_by_year', syncSupplyByPatternByYear);

	await runner.run('supply_by_pattern_hour_by_day', syncSupplyByPatternHourByDay);
	await runner.run('supply_by_pattern_hour_by_month', syncSupplyByPatternHourByMonth);
	await runner.run('supply_by_pattern_hour_by_year', syncSupplyByPatternHourByYear);

	runner.finish({ successMessage: `Finished Pattern Demand Metrics Sync (${timer.get()})` });
};
