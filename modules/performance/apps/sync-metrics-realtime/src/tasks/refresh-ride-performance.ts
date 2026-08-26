/* * */

import { Dates } from '@tmlmobilidade/dates';
import { buildCurrentRidePerformanceRefreshRange, refreshRidePerformanceRange, RIDE_PERFORMANCE_REFRESH_INTERVAL_MS, RIDE_PERFORMANCE_TIMEZONE } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

let LAST_COMPLETED_REFRESH_SLOT: null | number = null;

export function getRidePerformanceRefreshSlot(referenceNow: Dates) {
	return Math.floor(referenceNow.unix_timestamp / RIDE_PERFORMANCE_REFRESH_INTERVAL_MS);
}

export async function refreshRidePerformance(
	referenceNow = Dates.now(RIDE_PERFORMANCE_TIMEZONE),
) {
	const refreshSlot = getRidePerformanceRefreshSlot(referenceNow);
	if (LAST_COMPLETED_REFRESH_SLOT === refreshSlot) return;

	Logger.title('Refresh Ride Performance');
	const timer = new Timer();
	const result = await refreshRidePerformanceRange(buildCurrentRidePerformanceRefreshRange(referenceNow));
	if (!result.refreshed) {
		Logger.info({ message: 'Skipped ride-performance refresh because another refresh owns the lock.' });
		return;
	}

	LAST_COMPLETED_REFRESH_SLOT = refreshSlot;
	Logger.success(`Refreshed Ride Performance: ${result.source_rows_qty} rides across ${result.result_rows_qty} fact rows (${timer.get()})`);
}

/* * */
