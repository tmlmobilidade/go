/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type MetricRefreshType, type PassengerDemandDataStatus } from '@tmlmobilidade/go-types-performance';
import { type OperationalDateInt, type UnixTimestamp, validateOperationalDate, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';

import { PASSENGER_DEMAND_TIMEZONE } from '../../definition.js';

/* * */

export const PASSENGER_DEMAND_FIVE_MINUTE_BUCKET_MS = 5 * 60 * 1_000;
const PASSENGER_DEMAND_FIVE_MINUTE_RECENT_DAYS = 14;

/* * */

export interface PassengerDemandFiveMinuteRefreshRange {
	data_status: PassengerDemandDataStatus
	end_date: OperationalDateInt
	refresh_type: MetricRefreshType
	source_cutoff: UnixTimestamp
	start_date: OperationalDateInt
}

/* * */

export function listOperationalDates(startDate: OperationalDateInt, endDate: OperationalDateInt) {
	if (startDate > endDate) throw new Error('Passenger-demand five-minute refresh start date must not be after its end date.');

	const dates: OperationalDateInt[] = [];
	let cursor = Dates.fromOperationalDate(validateOperationalDate(String(startDate)), PASSENGER_DEMAND_TIMEZONE);

	while (cursor.operational_date_int <= endDate) {
		dates.push(cursor.operational_date_int);
		cursor = cursor.plus({ days: 1 });
	}

	return dates;
}

export function buildCurrentPassengerDemandFiveMinuteRefreshRange(
	referenceNow = Dates.now(PASSENGER_DEMAND_TIMEZONE),
): PassengerDemandFiveMinuteRefreshRange {
	return {
		data_status: 'provisional',
		end_date: referenceNow.operational_date_int,
		refresh_type: 'incremental',
		source_cutoff: validateUnixTimestamp(Math.floor(referenceNow.unix_timestamp / PASSENGER_DEMAND_FIVE_MINUTE_BUCKET_MS) * PASSENGER_DEMAND_FIVE_MINUTE_BUCKET_MS - 1),
		start_date: referenceNow.operational_date_int,
	};
}

export function buildRecentPassengerDemandFiveMinuteRefreshRange(
	referenceNow = Dates.now(PASSENGER_DEMAND_TIMEZONE),
	windowDays = PASSENGER_DEMAND_FIVE_MINUTE_RECENT_DAYS,
): PassengerDemandFiveMinuteRefreshRange {
	if (!Number.isInteger(windowDays) || windowDays < 1) throw new Error('Passenger-demand five-minute reconciliation window must contain at least one day.');

	const end = referenceNow.minus({ days: 1 });
	return {
		data_status: 'reconciled',
		end_date: end.operational_date_int,
		refresh_type: 'reconciliation',
		source_cutoff: referenceNow.unix_timestamp,
		start_date: end.minus({ days: windowDays - 1 }).operational_date_int,
	};
}

export function buildPassengerDemandFiveMinuteBackfillRange(
	startDate: OperationalDateInt,
	endDate: OperationalDateInt,
	referenceNow = Dates.now(PASSENGER_DEMAND_TIMEZONE),
): PassengerDemandFiveMinuteRefreshRange {
	if (startDate > endDate) throw new Error('Passenger-demand five-minute backfill start date must not be after its end date.');
	if (endDate >= referenceNow.operational_date_int) throw new Error('Passenger-demand five-minute backfill must only contain closed operational dates.');

	return {
		data_status: 'reconciled',
		end_date: endDate,
		refresh_type: 'backfill',
		source_cutoff: referenceNow.unix_timestamp,
		start_date: startDate,
	};
}

/* * */
