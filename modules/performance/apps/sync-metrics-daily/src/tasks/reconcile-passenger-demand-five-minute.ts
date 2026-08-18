/* * */

import { reconcileRecentPassengerDemandFiveMinute } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function reconcileDailyPassengerDemandFiveMinute() {
	Logger.title('Reconcile Five-Minute Passenger Demand');
	const timer = new Timer();
	const result = await reconcileRecentPassengerDemandFiveMinute();

	if (!result.refreshed) {
		Logger.info({ message: 'Skipped five-minute passenger-demand reconciliation because another refresh owns the lock.' });
		return;
	}

	Logger.success(`Reconciled Five-Minute Passenger Demand: ${result.source_rows_qty} validations across ${result.result_rows_qty} fact rows (${timer.get()})`);
}

/* * */
