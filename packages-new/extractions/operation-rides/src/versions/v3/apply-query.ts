/* * */

import { type OperationRidesV3ExtractionProperties } from '@tmlmobilidade/go-types-extractions';

import { operationRidesV3ExtractionQuery } from './query.js';

/* * */

type QueryParams = Record<string, number | string | string[]>;

/**
 * Builds the SQL and the params for a v3 Rides extraction.
 *
 * The WHERE clauses are assembled exactly like the Rides list endpoint assembles
 * them (`modules/operation/apps/api/src/endpoints/rides/handlers/list-rides.ts`),
 * so the same filters always select the same rides.
 *
 * @param properties The validated extraction properties.
 * @returns The query and its params, or `null` when the filters cannot match any ride.
 */
export function getSqlAndParams(properties: OperationRidesV3ExtractionProperties): null | { params: QueryParams, sql: string } {
	//

	//
	// An explicitly empty selection matches nothing. Skipping its condition
	// would instead widen the extraction to every value, so there is no query to run.

	const hasEmptyFilter = [
		properties.agency_ids,
		properties.analysis_at_least_one_vehicle_event_on_last_stop_grades,
		properties.analysis_expected_apex_validation_interval_grades,
		properties.analysis_simple_three_vehicle_events_grades,
		properties.analysis_transaction_sequentiality_grades,
		properties.start_delay_statuses,
		properties.end_delay_statuses,
		properties.operational_statuses,
	].some(value => Array.isArray(value) && value.length === 0);

	if (hasEmptyFilter) return null;

	//
	// Build query parameters

	const search = properties.search?.trim() || null;

	const params: QueryParams = {
		1: properties.start_time_scheduled_start,
		2: properties.start_time_scheduled_end,
	};

	let paramIndex = 3;

	const addParam = (value: number | string): string => {
		const index = paramIndex++;
		params[String(index)] = value;
		return `$${index}`;
	};

	//
	// Build WHERE conditions.
	//
	// Attributes that are identical across every version of a ride (agency,
	// id/headsign search) go into the ride conditions, so the primary key can prune
	// the read. Attributes that change between versions (driver/vehicle ids) and
	// every derived status or grade must go into the derived conditions.

	const rideConditions: string[] = [];
	const conditions: string[] = [];

	//
	// Agency IDs

	if (properties.agency_ids.length) {
		const placeholders = properties.agency_ids.map(addParam);
		rideConditions.push(`agency_id IN (${placeholders.join(', ')})`);
	}

	//
	// Driver IDs

	if (properties.driver_ids?.length) {
		const placeholders = properties.driver_ids.map(addParam);
		conditions.push(`hasAny(driver_ids, [${placeholders.join(', ')}])`);
	}

	//
	// Vehicle IDs

	if (properties.vehicle_ids?.length) {
		const placeholders = properties.vehicle_ids.map(addParam);
		conditions.push(`hasAny(vehicle_ids, [${placeholders.join(', ')}])`);
	}

	//
	// Operational statuses

	if (properties.operational_statuses?.length) {
		const placeholders = properties.operational_statuses.map(addParam);
		conditions.push(`operational_status IN (${placeholders.join(', ')})`);
	}

	//
	// Delay statuses and analysis grades
	//
	// `none` represents a NULL value in ClickHouse.
	//
	//   none          -> IS NULL
	//   delayed/...   -> IN (...)

	const addNullableFilter = (column: string, values: string[]): void => {
		const knownValues = values.filter(value => value !== 'none');
		const valueConditions: string[] = [];
		if (knownValues.length) {
			const placeholders = knownValues.map(addParam);
			valueConditions.push(`${column} IN (${placeholders.join(', ')})`);
		}
		if (values.includes('none')) valueConditions.push(`${column} IS NULL`);
		conditions.push(`(${valueConditions.join('\n\t\t\tOR ')})`);
	};

	if (properties.start_delay_statuses?.length) {
		addNullableFilter('start_delay_status', properties.start_delay_statuses);
	}

	if (properties.end_delay_statuses?.length) {
		addNullableFilter('end_delay_status', properties.end_delay_statuses);
	}

	if (properties.analysis_at_least_one_vehicle_event_on_last_stop_grades?.length) {
		addNullableFilter('analysis_at_least_one_vehicle_event_on_last_stop_grade', properties.analysis_at_least_one_vehicle_event_on_last_stop_grades);
	}

	if (properties.analysis_expected_apex_validation_interval_grades?.length) {
		addNullableFilter('analysis_expected_apex_validation_interval_grade', properties.analysis_expected_apex_validation_interval_grades);
	}

	if (properties.analysis_simple_three_vehicle_events_grades?.length) {
		addNullableFilter('analysis_simple_three_vehicle_events_grade', properties.analysis_simple_three_vehicle_events_grades);
	}

	if (properties.analysis_transaction_sequentiality_grades?.length) {
		addNullableFilter('analysis_transaction_sequentiality_grade', properties.analysis_transaction_sequentiality_grades);
	}

	//
	// Search

	if (search) {
		const partialSearch = addParam(`%${search}%`);
		rideConditions.push(`(_id ILIKE ${partialSearch} OR headsign ILIKE ${partialSearch})`);
	}

	//
	// Assemble the query

	const joinConditions = (items: string[]): string => (items.length ? `\n\t\t\tAND ${items.join('\n\t\t\tAND ')}` : '');

	const sql = operationRidesV3ExtractionQuery
		.replace('--RIDE FILTERS HERE--', joinConditions(rideConditions))
		.replace('--DERIVED FILTERS HERE--', joinConditions(conditions));

	return { params, sql };
}
