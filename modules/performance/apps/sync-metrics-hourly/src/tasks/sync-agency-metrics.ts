/* * */

import { syncDemandByAgencyByDay } from '@/syncs/demand_by_agency/by_day.js';
import { syncDemandByAgencyByMonth } from '@/syncs/demand_by_agency/by_month.js';
import { syncDemandByAgencyByYear } from '@/syncs/demand_by_agency/by_year.js';
import { computeTopDemandByAgency } from '@/syncs/demand_by_agency/record_day.js';
import { computeTopDemandByAgencyByDayType } from '@/syncs/demand_by_agency/top_by_day_type.js';
import { syncSupplyByAgencyByDay } from '@/syncs/supply_by_agency/by_day.js';
import { syncSupplyByAgencyByMonth } from '@/syncs/supply_by_agency/by_month.js';
import { syncSupplyByAgencyByYear } from '@/syncs/supply_by_agency/by_year.js';
import { MetricSyncRunner } from '@/utils/run-metric.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncAgencyMetrics = async (): Promise<void> => {
	const timer = new Timer();
	const runner = new MetricSyncRunner('Agency metrics');

	Logger.title('Starting Agency Demand Metrics Sync');
	Logger.divider();

	await runner.run('demand_by_agency_by_day', syncDemandByAgencyByDay);
	await runner.run('demand_by_agency_by_month', syncDemandByAgencyByMonth);
	await runner.run('demand_by_agency_by_year', syncDemandByAgencyByYear);

	await runner.runParallel([
		{ fn: computeTopDemandByAgency, name: 'top_demand_by_agency' },
		{ fn: computeTopDemandByAgencyByDayType, name: 'top_demand_by_agency_by_day_type' },
	]);

	await runner.run('supply_by_agency_by_day', syncSupplyByAgencyByDay);
	await runner.run('supply_by_agency_by_month', syncSupplyByAgencyByMonth);
	await runner.run('supply_by_agency_by_year', syncSupplyByAgencyByYear);

	runner.finish({ successMessage: `Finished Agency Demand Metrics Sync (${timer.get()})` });
};
