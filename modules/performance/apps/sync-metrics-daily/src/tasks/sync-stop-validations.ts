/* * */

import { syncValidationsByStopBySequence } from '@/syncs/stop-validations/by_stop_sequence.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncStopValidationsMetrics = async (): Promise<void> => {
	const timer = new Timer();

	Logger.title('Starting Stop Validations Metrics Sync');
	Logger.divider();

	try {
		await syncValidationsByStopBySequence();

		Logger.success(`Finished Stop Validations Metrics Sync (${timer.get()})`);
	} catch (error) {
		Logger.error({ message: 'Failed to sync Stop Validations Metrics' });
		Logger.error(error);
		throw error;
	}
};
