/* * */

import { Dates } from '@tmlmobilidade/dates';

/* * */

/** Ride `_id` from rides-feeder: `{plan_id}-{agency_id}-{operational_date}-{trip_id}`. */
const RIDE_ID_PATTERN = /^.+-\d+-(\d{8})-(.+)$/;

export interface TripRef {
	/** Original CLI value. */
	input: string
	/** Service day as yyyyMMdd (matches Mongo / ride `_id`). */
	operationalDate: string
	/** Same day as yyyy-MM-dd for ClickHouse `Date` params. */
	operationalDateClickHouse: string
	/** Full ride `_id` when parsed from a ride id; null for a bare trip id. */
	rideId: null | string
	/** `operation.simplified_vehicle_events.trip_id` (e.g. `4701_0_1|2500|1930`). */
	tripId: string
}

function operationalDateToClickHouseDate(operationalDate: string): string {
	return `${operationalDate.slice(0, 4)}-${operationalDate.slice(4, 6)}-${operationalDate.slice(6, 8)}`;
}

/**
 * Resolves the ClickHouse trip key from a ride id or bare trip id.
 *
 * - Ride id: `6R5PX-44-20260525-4701_0_1|2500|1930` → trip `4701_0_1|2500|1930`, date `20260525`
 * - Trip id: `4701_0_1|2500|1930` → operational date from `--time-start` (Europe/Lisbon)
 */
export function parseTripRef(input: string, timeStartMs: number): TripRef {
	const rideMatch = input.match(RIDE_ID_PATTERN);
	if (rideMatch) {
		const operationalDate = rideMatch[1];
		const tripId = rideMatch[2];
		return {
			input,
			operationalDate,
			operationalDateClickHouse: operationalDateToClickHouseDate(operationalDate),
			rideId: input,
			tripId,
		};
	}

	if (input.includes('|')) {
		const operationalDate = Dates.fromUnixTimestamp(timeStartMs).setZone('Europe/Lisbon', 'offset_only').operational_date;
		return {
			input,
			operationalDate,
			operationalDateClickHouse: operationalDateToClickHouseDate(operationalDate),
			rideId: null,
			tripId: input,
		};
	}

	throw new Error(
		`Cannot parse trip reference "${input}". `
		+ 'Expected a ride id (plan-agency-yyyyMMdd-trip_id) or a trip id containing "|" (e.g. 4701_0_1|2500|1930).',
	);
}
