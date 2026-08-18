/* * */

import { Dates } from '@tmlmobilidade/dates';
import { buildCurrentPassengerDemandFiveMinuteRefreshRange, PASSENGER_DEMAND_TIMEZONE, refreshPassengerDemandFiveMinuteRange } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const REFRESH_INTERVAL_MS = 5 * 60 * 1_000;

let LAST_COMPLETED_REFRESH_SLOT: null | number = null;

/* * */

export function getPassengerDemandFiveMinuteRefreshSlot(referenceNow: Dates) {
	return Math.floor(referenceNow.unix_timestamp / REFRESH_INTERVAL_MS);
}

export async function refreshPassengerDemandFiveMinute(
	referenceNow = Dates.now(PASSENGER_DEMAND_TIMEZONE),
) {
	const refreshSlot = getPassengerDemandFiveMinuteRefreshSlot(referenceNow);
	if (LAST_COMPLETED_REFRESH_SLOT === refreshSlot) return;

	Logger.title('Refresh Five-Minute Passenger Demand');
	const timer = new Timer();
	const result = await refreshPassengerDemandFiveMinuteRange(
		buildCurrentPassengerDemandFiveMinuteRefreshRange(referenceNow),
	);

	if (!result.refreshed) {
		Logger.info({ message: 'Skipped five-minute passenger-demand refresh because another refresh owns the lock.' });
		return;
	}

	LAST_COMPLETED_REFRESH_SLOT = refreshSlot;
	Logger.success(`Refreshed Five-Minute Passenger Demand: ${result.source_rows_qty} validations across ${result.result_rows_qty} fact rows (${timer.get()})`);
}

/* * */
