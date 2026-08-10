/* * */

import { syncDemandByProductByAgencyByDay } from '@/syncs/demand_by_product/by_agency_by_day.js';
import { syncDemandByProductByAgencyByMonth } from '@/syncs/demand_by_product/by_agency_by_month.js';
import { syncDemandByProductByAgencyByYear } from '@/syncs/demand_by_product/by_agency_by_year.js';
import { syncDemandByProductByLineByDay } from '@/syncs/demand_by_product/by_line_by_day.js';
import { syncDemandByProductByLineByMonth } from '@/syncs/demand_by_product/by_line_by_month.js';
import { syncDemandByProductByLineByYear } from '@/syncs/demand_by_product/by_line_by_year.js';
import { syncDemandByProductByPatternByDay } from '@/syncs/demand_by_product/by_pattern_by_day.js';
import { syncDemandByProductByPatternByMonth } from '@/syncs/demand_by_product/by_pattern_by_month.js';
import { syncDemandByProductByPatternByYear } from '@/syncs/demand_by_product/by_pattern_by_year.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncProductMetrics = async (): Promise<void> => {
	const timer = new Timer();

	Logger.title('Starting Product Demand Metrics Sync');
	Logger.divider();

	try {
		await syncDemandByProductByAgencyByDay();
		await syncDemandByProductByAgencyByMonth();
		await syncDemandByProductByAgencyByYear();

		await syncDemandByProductByLineByDay();
		await syncDemandByProductByLineByMonth();
		await syncDemandByProductByLineByYear();

		await syncDemandByProductByPatternByDay();
		await syncDemandByProductByPatternByMonth();
		await syncDemandByProductByPatternByYear();

		Logger.success(`Finished Product Demand Metrics Sync (${timer.get()})`);
	} catch (error) {
		Logger.error({ message: 'Failed to sync Product Demand Metrics' });
		Logger.error(error);
		throw error;
	}
};
