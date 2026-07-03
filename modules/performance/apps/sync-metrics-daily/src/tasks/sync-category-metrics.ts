/* * */

import { syncDemandByCategoryByAgencyByDay } from '@/syncs/demand_by_category/by_agency_by_day.js';
import { syncDemandByCategoryByAgencyByMonth } from '@/syncs/demand_by_category/by_agency_by_month.js';
import { syncDemandByCategoryByAgencyByYear } from '@/syncs/demand_by_category/by_agency_by_year.js';
import { syncDemandByCategoryByLineByDay } from '@/syncs/demand_by_category/by_line_by_day.js';
import { syncDemandByCategoryByLineByMonth } from '@/syncs/demand_by_category/by_line_by_month.js';
import { syncDemandByCategoryByLineByYear } from '@/syncs/demand_by_category/by_line_by_year.js';
import { syncDemandByCategoryByPatternByDay } from '@/syncs/demand_by_category/by_pattern_by_day.js';
import { syncDemandByCategoryByPatternByMonth } from '@/syncs/demand_by_category/by_pattern_by_month.js';
import { syncDemandByCategoryByPatternByYear } from '@/syncs/demand_by_category/by_pattern_by_year.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncCategoryMetrics = async (): Promise<void> => {
	const timer = new Timer();

	Logger.title('Starting Category Demand Metrics Sync');
	Logger.divider();

	try {
		await syncDemandByCategoryByAgencyByDay();
		await syncDemandByCategoryByAgencyByMonth();
		await syncDemandByCategoryByAgencyByYear();

		await syncDemandByCategoryByLineByDay();
		await syncDemandByCategoryByLineByMonth();
		await syncDemandByCategoryByLineByYear();

		await syncDemandByCategoryByPatternByDay();
		await syncDemandByCategoryByPatternByMonth();
		await syncDemandByCategoryByPatternByYear();

		Logger.success(`Finished Category Demand Metrics Sync (${timer.get()})`);
	} catch (error) {
		Logger.error({ message: 'Failed to sync Category Demand Metrics' });
		Logger.error(error);
		throw error;
	}
};
