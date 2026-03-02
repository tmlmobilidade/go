/* * */

import { syncDemandByLineByDay } from '@/syncs/demand_by_line/by_day.js';
import { syncDemandByLineByMonth } from '@/syncs/demand_by_line/by_month.js';
import { syncDemandByLineByYear } from '@/syncs/demand_by_line/by_year.js';
import { computeMeanDemandByLineByMonth } from '@/syncs/demand_by_line/mean_by_month.js';
import { computeTop30DayPerformanceByLine } from '@/syncs/demand_by_line/top_30day_performance.js';
import { computeTopMeanDemandByLineByMonth } from '@/syncs/demand_by_line/top_mean_by_month.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncLineMetrics = async (): Promise<void> => {
	const timer = new Timer();

	Logger.title('Starting Line Demand Metrics Sync');
	Logger.divider();

	try {
		await syncDemandByLineByDay();
		await syncDemandByLineByMonth();
		await syncDemandByLineByYear();

		await computeMeanDemandByLineByMonth();
		await computeTopMeanDemandByLineByMonth();
		await computeTop30DayPerformanceByLine();

		Logger.success(`Finished Line Demand Metrics Sync (${timer.get()})`);
	} catch (error) {
		Logger.error('Failed to sync Line Demand Metrics');
		Logger.error(error);
		throw error;
	}
};
