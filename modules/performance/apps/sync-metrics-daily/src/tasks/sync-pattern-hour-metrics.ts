/* * */

import { syncDemandByPatternHourByDay } from '@/syncs/demand_by_pattern_hour/by_day.js';
import { syncDemandByPatternHourByMonth } from '@/syncs/demand_by_pattern_hour/by_month.js';
import { syncDemandByPatternHourByYear } from '@/syncs/demand_by_pattern_hour/by_year.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncPatternHourMetrics = async (): Promise<void> => {
	const timer = new Timer();

	Logger.title('Starting Pattern Hour Demand Metrics Sync');
	Logger.divider();

	try {
		await syncDemandByPatternHourByDay();
		await syncDemandByPatternHourByMonth();
		await syncDemandByPatternHourByYear();

		Logger.success(`Finished Pattern Hour Demand Metrics Sync (${timer.get()})`);
	} catch (error) {
		Logger.error({ message: 'Failed to sync Pattern Hour Demand Metrics' });
		Logger.error(error);
		throw error;
	}
};
