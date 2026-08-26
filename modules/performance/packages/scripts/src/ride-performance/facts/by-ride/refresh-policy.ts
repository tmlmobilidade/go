/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type MetricRefreshType, type RidePerformanceDataStatus } from '@tmlmobilidade/go-types-performance';
import { type OperationalDateInt, type UnixTimestamp, validateOperationalDate, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';

import { RIDE_PERFORMANCE_TIMEZONE } from '../../definition.js';

/* * */

export const RIDE_PERFORMANCE_REFRESH_INTERVAL_MS = 5 * 60 * 1_000;
export const RIDE_PERFORMANCE_RECONCILIATION_DAYS = 14;
export const RIDE_PERFORMANCE_BACKFILL_MAX_DAYS = 31;

export interface RidePerformanceRefreshRange {
	data_status: RidePerformanceDataStatus
	end_date: OperationalDateInt
	refresh_type: MetricRefreshType
	source_cutoff: UnixTimestamp
	start_date: OperationalDateInt
}

export function listRidePerformanceOperationalDates(startDate: OperationalDateInt, endDate: OperationalDateInt) {
	if (startDate > endDate) throw new Error('Ride-performance refresh start date must not be after its end date.');

	const dates: OperationalDateInt[] = [];
	let cursor = Dates.fromOperationalDate(validateOperationalDate(String(startDate)), RIDE_PERFORMANCE_TIMEZONE);
	while (cursor.operational_date_int <= endDate) {
		dates.push(cursor.operational_date_int);
		cursor = cursor.plus({ days: 1 });
	}
	return dates;
}

export function buildCurrentRidePerformanceRefreshRange(
	referenceNow = Dates.now(RIDE_PERFORMANCE_TIMEZONE),
): RidePerformanceRefreshRange {
	return {
		data_status: 'provisional',
		end_date: referenceNow.operational_date_int,
		refresh_type: 'incremental',
		source_cutoff: validateUnixTimestamp(Math.floor(referenceNow.unix_timestamp / RIDE_PERFORMANCE_REFRESH_INTERVAL_MS) * RIDE_PERFORMANCE_REFRESH_INTERVAL_MS - 1),
		start_date: referenceNow.operational_date_int,
	};
}

export function buildRecentRidePerformanceRefreshRange(
	referenceNow = Dates.now(RIDE_PERFORMANCE_TIMEZONE),
	windowDays = RIDE_PERFORMANCE_RECONCILIATION_DAYS,
): RidePerformanceRefreshRange {
	if (!Number.isInteger(windowDays) || windowDays < 1) throw new Error('Ride-performance reconciliation window must contain at least one day.');

	const end = referenceNow.minus({ days: 1 });
	return {
		data_status: 'reconciled',
		end_date: end.operational_date_int,
		refresh_type: 'reconciliation',
		source_cutoff: referenceNow.unix_timestamp,
		start_date: end.minus({ days: windowDays - 1 }).operational_date_int,
	};
}

export function buildRidePerformanceBackfillRange(
	startDate: OperationalDateInt,
	endDate: OperationalDateInt,
	referenceNow = Dates.now(RIDE_PERFORMANCE_TIMEZONE),
): RidePerformanceRefreshRange {
	const dates = listRidePerformanceOperationalDates(startDate, endDate);
	if (endDate >= referenceNow.operational_date_int) throw new Error('Ride-performance backfill must only contain closed operational dates.');
	if (dates.length > RIDE_PERFORMANCE_BACKFILL_MAX_DAYS) throw new Error(`Ride-performance backfill is limited to ${RIDE_PERFORMANCE_BACKFILL_MAX_DAYS} dates per run.`);

	return {
		data_status: 'reconciled',
		end_date: endDate,
		refresh_type: 'backfill',
		source_cutoff: referenceNow.unix_timestamp,
		start_date: startDate,
	};
}

/* * */
