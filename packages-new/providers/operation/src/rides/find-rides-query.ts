/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type GetRidesQuery, GetRidesQuerySchema, type RideView } from '@tmlmobilidade/go-types-operation';

import { ridesViewQuery } from './ride-view-query.js';

/**
 * Finds rides matching the provided query.
 * The query schema is shared with the frontend, while this function owns
 * the ClickHouse-specific implementation of those filters.
 * The SQL query itself owns the RideView read model and all derived values.
 * @param query The normalized rides query.
 * @returns A promise resolving to the matching rides.
 */
export async function findRidesByQuery(query: GetRidesQuery): Promise<RideView[]> {
	//

	//
	// Validate the query.

	const validatedQuery = GetRidesQuerySchema.parse(query);

	//
	// Build the query parameters and WHERE conditions independently.
	// Parameters 1 and 2 are reserved for the scheduled start time range,
	// which is used inside the rides_latest CTE.

	const params: Record<string, number | string> = {
		1: validatedQuery.start_time_scheduled_start,
		2: validatedQuery.start_time_scheduled_end,
	};

	const conditions: string[] = [];

	let paramIndex = 3;

	//
	// Helper for adding a parameter.

	const addParam = (value: number | string): string => {
		const index = paramIndex++;
		params[String(index)] = value;
		return `$${index}`;
	};

	//
	// Helper for building an IN condition.

	const addInCondition = (column: string, values: readonly (number | string)[]): void => {
		if (!values.length) return;
		const placeholders = values.map(addParam);
		conditions.push(`${column} IN (${placeholders.join(', ')})`);
	};

	//
	// Helper for building a nullable IN condition.
	// A null value means that the caller wants rows where the column
	// itself is NULL.

	const addNullableInCondition = (column: string, values: readonly (null | number | string)[]): void => {
		if (!values.length) return;

		const nonNullValues = values.filter((value): value is number | string => value !== null);

		const columnConditions: string[] = [];

		if (nonNullValues.length) {
			const placeholders = nonNullValues.map(addParam);
			columnConditions.push(`${column} IN (${placeholders.join(', ')})`);
		}

		if (values.includes(null)) {
			columnConditions.push(`${column} IS NULL`);
		}

		conditions.push(
			columnConditions.length === 1
				? columnConditions[0]
				: `(${columnConditions.join(' OR ')})`,
		);
	};

	//
	// Agency IDs.

	addInCondition('agency_id', validatedQuery.agency_ids);

	//
	// Route short names.

	if (validatedQuery.route_short_names?.length) {
		addInCondition('route_short_name', validatedQuery.route_short_names);
	}

	//
	// Driver IDs.
	//
	// A Ride can have multiple drivers. A ride matches when at least one
	// of its driver IDs is included in the query.

	if (validatedQuery.driver_ids?.length) {
		const placeholders = validatedQuery.driver_ids.map(addParam);
		conditions.push(`hasAny(driver_ids, [${placeholders.join(', ')}])`);
	}

	//
	// Vehicle IDs.
	//
	// A Ride can have multiple vehicles. A ride matches when at least one
	// of its vehicle IDs is included in the query.

	if (validatedQuery.vehicle_ids?.length) {
		const placeholders = validatedQuery.vehicle_ids.map(addParam);
		conditions.push(`hasAny(vehicle_ids, [${placeholders.join(', ')}])`);
	}

	//
	// Operational statuses.

	if (validatedQuery.operational_statuses?.length) {
		addInCondition('operational_status', validatedQuery.operational_statuses);
	}

	//
	// Seen statuses.

	if (validatedQuery.seen_statuses?.length) {
		addInCondition('seen_status', validatedQuery.seen_statuses);
	}

	//
	// Delay statuses.
	//
	// A ride matches when either its start delay or its end delay matches
	// one of the requested statuses.
	//
	// A null value means that either delay status is NULL.

	if (validatedQuery.delay_statuses?.length) {
		const delayConditions: string[] = [];
		const nonNullDelayStatuses = validatedQuery.delay_statuses.filter((value): value is NonNullable<typeof value> => value !== null);

		if (nonNullDelayStatuses.length) {
			const placeholders = nonNullDelayStatuses.map(addParam);
			delayConditions.push(`start_delay_status IN (${placeholders.join(', ')})`);
			// delayConditions.push(`end_delay_status IN (${placeholders.join(', ')})`);
		}

		if (validatedQuery.delay_statuses.includes(null)) {
			delayConditions.push('start_delay_status IS NULL');
			// delayConditions.push('end_delay_status IS NULL');
		}

		conditions.push(`(${delayConditions.join(' OR ')})`);
	}

	//
	// Analysis: at least one vehicle event on last stop.

	if (validatedQuery.analysis_at_least_one_vehicle_event_on_last_stop_grades?.length) {
		addNullableInCondition('analysis_at_least_one_vehicle_event_on_last_stop_grade', validatedQuery.analysis_at_least_one_vehicle_event_on_last_stop_grades);
	}

	//
	// Analysis: expected Apex validation interval.

	if (validatedQuery.analysis_expected_apex_validation_interval_grades?.length) {
		addNullableInCondition('analysis_expected_apex_validation_interval_grade', validatedQuery.analysis_expected_apex_validation_interval_grades);
	}

	//
	// Analysis: simple three vehicle events.

	if (validatedQuery.analysis_simple_three_vehicle_events_grades?.length) {
		addNullableInCondition('analysis_simple_three_vehicle_events_grade', validatedQuery.analysis_simple_three_vehicle_events_grades);
	}

	//
	// Analysis: transaction sequentiality.

	if (validatedQuery.analysis_transaction_sequentiality_grades?.length) {
		addNullableInCondition('analysis_transaction_sequentiality_grade', validatedQuery.analysis_transaction_sequentiality_grades);
	}

	//
	// Search.

	if (validatedQuery.search) {
		const search = addParam(`%${validatedQuery.search}%`);
		conditions.push(`
			(
				toString(_id) ILIKE ${search}
				OR headsign ILIKE ${search}
				OR route_short_name ILIKE ${search}
				OR route_long_name ILIKE ${search}
			)
		`);
	}

	//
	// Acceptance statuses.
	//
	// Not implemented yet because acceptance data remains in MongoDB.

	//
	// Stop IDs.
	//
	// Not implemented yet because RideView does not currently contain
	// stop IDs.

	//
	// Ticketing statuses.
	//
	// Not implemented yet because RideView does not currently contain
	// ticketing status data.

	//
	// Build the final WHERE clause.

	const where = conditions.length
		? conditions.join('\n\tAND ')
		: '1 = 1';

	//
	// Inject the filters into the RideView query.
	//
	// The SQL template is trusted application SQL. User-provided values
	// remain parameterized and are never interpolated into the query.

	const sql = ridesViewQuery.replace(
		'/* RIDE_FILTERS */',
		where,
	);

	//
	// Execute the query.

	const selectResult = await labDb.operation.rides.queryFromString(
		sql,
		params,
	) as RideView[];

	//
	// Return the matching rides.

	return selectResult ?? [];
}
