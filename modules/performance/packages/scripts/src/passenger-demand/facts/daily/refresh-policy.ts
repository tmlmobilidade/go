/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

import { PASSENGER_DEMAND_TIMEZONE } from '../../definition.js';

/* * */

const PASSENGER_DEMAND_DAILY_RECENT_DAYS = 7;

/* * */

export interface PassengerDemandDailyRefreshPlan {
	end_date: OperationalDateInt
	partition_months: number[]
	start_date: OperationalDateInt
}

/* * */

export function buildPassengerDemandDailyRefreshPlan(
	referenceNow = Dates.now(PASSENGER_DEMAND_TIMEZONE),
): PassengerDemandDailyRefreshPlan {
	const endDate = referenceNow.operational_date_int;
	const startDate = referenceNow
		.minus({ days: PASSENGER_DEMAND_DAILY_RECENT_DAYS - 1 })
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
