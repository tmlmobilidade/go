/* * */

import { Dates } from '@tmlmobilidade/dates';
import { buildPassengerDemandDailyRefreshPlan, PASSENGER_DEMAND_TIMEZONE, refreshRecentPassengerDemandDailyFact } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const REFRESH_INTERVAL_MS = 5 * 60 * 1_000; // 5 minutes

let LAST_COMPLETED_REFRESH_SLOT: null | number = null;

/* * */

export function getPassengerDemandDailyRefreshSlot(referenceNow: Dates) {
	return Math.floor(referenceNow.unix_timestamp / REFRESH_INTERVAL_MS);
}

export async function refreshPassengerDemandDaily(
	referenceNow = Dates.now(PASSENGER_DEMAND_TIMEZONE),
) {
	const refreshSlot = getPassengerDemandDailyRefreshSlot(referenceNow);
	if (LAST_COMPLETED_REFRESH_SLOT === refreshSlot) return;

	Logger.title('Refresh Recent Daily Passenger Demand');
	const timer = new Timer();
	const result = await refreshRecentPassengerDemandDailyFact(
		buildPassengerDemandDailyRefreshPlan(referenceNow),
	);

	if (!result.refreshed) {
		Logger.info({ message: 'Skipped recent daily passenger-demand refresh because another refresh owns the lock.' });
		return;
	}

	LAST_COMPLETED_REFRESH_SLOT = refreshSlot;
	Logger.success(`Refreshed Daily Passenger Demand: ${result.source_rows_qty} validations across ${result.result_rows_qty} fact rows (${timer.get()})`);
}

/* * */
