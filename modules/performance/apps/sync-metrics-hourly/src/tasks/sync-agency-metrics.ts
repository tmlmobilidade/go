/* * */

import { syncDemandByAgencyByDay } from '@/syncs/demand_by_agency/by_day.js';
import { syncDemandByAgencyByMonth } from '@/syncs/demand_by_agency/by_month.js';
import { syncDemandByAgencyByYear } from '@/syncs/demand_by_agency/by_year.js';
import { computeTopDemandByAgency } from '@/syncs/demand_by_agency/record_day.js';
import { computeTopDemandByAgencyByDayType } from '@/syncs/demand_by_agency/top_by_day_type.js';
import { syncSupplyByAgencyByDay } from '@/syncs/supply_by_agency/by_day.js';
import { syncSupplyByAgencyByMonth } from '@/syncs/supply_by_agency/by_month.js';
import { syncSupplyByAgencyByYear } from '@/syncs/supply_by_agency/by_year.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncAgencyMetrics = async (): Promise<void> => {
	const timer = new Timer();

	Logger.title('Starting Agency Demand Metrics Sync');
	Logger.divider();

	try {
		await syncDemandByAgencyByDay();
		await syncDemandByAgencyByMonth();
		await syncDemandByAgencyByYear();

		await computeTopDemandByAgency();
		await computeTopDemandByAgencyByDayType();

		await syncSupplyByAgencyByDay();
		await syncSupplyByAgencyByMonth();
		await syncSupplyByAgencyByYear();

		Logger.success(`Finished Agency Demand Metrics Sync (${timer.get()})`);
	} catch (error) {
		Logger.error('Failed to sync Agency Demand Metrics');
		Logger.error(error);
		throw error;
	}
};
