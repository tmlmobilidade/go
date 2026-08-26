/* * */

import { reconcileRecentRidePerformance } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function reconcileDailyRidePerformance() {
	Logger.title('Reconcile Ride Performance');
	const timer = new Timer();
	const result = await reconcileRecentRidePerformance();

	if (!result.refreshed) {
		Logger.info({ message: 'Skipped ride-performance reconciliation because another refresh owns the lock.' });
		return;
	}

	Logger.success(`Reconciled Ride Performance: ${result.source_rows_qty} rides across ${result.result_rows_qty} fact rows (${timer.get()})`);
}

/* * */
