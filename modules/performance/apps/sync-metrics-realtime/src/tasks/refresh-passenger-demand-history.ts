/* * */

import { Dates } from '@tmlmobilidade/dates';
import { buildPassengerDemandHistoryRefreshPlan, PASSENGER_DEMAND_HISTORY_TIMEZONE, refreshRecentPassengerDemandHistory } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const REFRESH_INTERVAL_MS = 5 * 60 * 1_000; // 5 minutes

let LAST_COMPLETED_REFRESH_SLOT: null | number = null;

/* * */

export function getPassengerDemandHistoryRefreshSlot(referenceNow: Dates) {
	return Math.floor(referenceNow.unix_timestamp / REFRESH_INTERVAL_MS);
}

export async function refreshPassengerDemandHistory(
	referenceNow = Dates.now(PASSENGER_DEMAND_HISTORY_TIMEZONE),
) {
	const refreshSlot = getPassengerDemandHistoryRefreshSlot(referenceNow);
	if (LAST_COMPLETED_REFRESH_SLOT === refreshSlot) return;

	Logger.title('Refresh Recent Passenger Demand History');
	const timer = new Timer();
	const result = await refreshRecentPassengerDemandHistory(
		buildPassengerDemandHistoryRefreshPlan(referenceNow),
	);

	if (!result.refreshed) {
		Logger.info({ message: 'Skipped recent passenger-demand history refresh because another refresh owns the lock.' });
		return;
	}

	LAST_COMPLETED_REFRESH_SLOT = refreshSlot;
	Logger.success(`Refreshed Passenger Demand History: ${result.source_rows_qty} validations across ${result.result_rows_qty} fact rows (${timer.get()})`);
}

/* * */
