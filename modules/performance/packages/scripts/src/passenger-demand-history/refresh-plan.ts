/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

import { PASSENGER_DEMAND_HISTORY_TIMEZONE, PASSENGER_DEMAND_HISTORY_WINDOW_DAYS } from './constants.js';

/* * */

export interface PassengerDemandHistoryRefreshPlan {
	end_date: OperationalDateInt
	partition_months: number[]
	start_date: OperationalDateInt
}

/* * */

export function buildPassengerDemandHistoryRefreshPlan(
	referenceNow = Dates.now(PASSENGER_DEMAND_HISTORY_TIMEZONE),
): PassengerDemandHistoryRefreshPlan {
	const endDate = referenceNow.operational_date_int;
	const startDate = referenceNow
		.minus({ days: PASSENGER_DEMAND_HISTORY_WINDOW_DAYS - 1 })
		.operational_date_int;
	const partitionMonths = [...new Set([
		Math.trunc(endDate / 100),
		Math.trunc(startDate / 100),
	])].sort((left, right) => left - right);

	return {
		end_date: endDate,
		partition_months: partitionMonths,
		start_date: startDate,
	};
}

/* * */
