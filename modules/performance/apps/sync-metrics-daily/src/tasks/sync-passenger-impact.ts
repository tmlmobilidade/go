/* * */

import { syncPassengerImpactServiceFailuresByDay } from '@/syncs/passenger-impact/passenger-impact_by_day.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncPassengerImpactMetrics = async (): Promise<void> => {
	const timer = new Timer();

	Logger.title('Starting Passenger Impact Metrics Sync');
	Logger.divider();

	try {
		await syncPassengerImpactServiceFailuresByDay();

		Logger.success(`Finished Passenger Impact Metrics Sync (${timer.get()})`);
	} catch (error) {
		Logger.error({ message: 'Failed to sync Passenger Impact Metrics' });
		Logger.error(error);
		throw error;
	}
};
