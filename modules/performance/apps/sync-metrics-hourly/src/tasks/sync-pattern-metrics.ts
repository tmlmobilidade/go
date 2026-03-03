/* * */

import { syncDemandByPatternByDay } from '@/syncs/demand_by_pattern/by_day.js';
import { syncDemandByPatternByMonth } from '@/syncs/demand_by_pattern/by_month.js';
import { syncDemandByPatternByYear } from '@/syncs/demand_by_pattern/by_year.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncPatternMetrics = async (): Promise<void> => {
	const timer = new Timer();

	Logger.title('Starting Pattern Demand Metrics Sync');
	Logger.divider();

	try {
		await syncDemandByPatternByDay();
		await syncDemandByPatternByMonth();
		await syncDemandByPatternByYear();

		Logger.success(`Finished Pattern Demand Metrics Sync (${timer.get()})`);
	} catch (error) {
		Logger.error('Failed to sync Pattern Demand Metrics');
		Logger.error(error);
		throw error;
	}
};
