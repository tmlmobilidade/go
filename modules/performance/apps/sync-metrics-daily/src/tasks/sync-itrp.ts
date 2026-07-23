/* * */

import { syncItrpByPattern } from '@/syncs/ITRP/by_pattern.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncItrpMetrics = async (): Promise<void> => {
	const timer = new Timer();

	Logger.title('Starting ITRP Metrics Sync');
	Logger.divider();

	try {
		await syncItrpByPattern();

		Logger.success(`Finished ITRP Metrics Sync (${timer.get()})`);
	} catch (error) {
		Logger.error({ message: 'Failed to sync ITRP Metrics' });
		Logger.error(error);
		throw error;
	}
};
