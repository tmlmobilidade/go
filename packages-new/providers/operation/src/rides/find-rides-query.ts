/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type GetRidesQuery, GetRidesQuerySchema } from '@tmlmobilidade/go-types-operation';
import { type Ride } from '@tmlmobilidade/go-types-operation';

/**
 * Finds rides matching the provided query.
 * This function owns the ClickHouse-specific implementation of the
 * frontend/backend GetRidesQuery schema. This function validates the query
 * and builds the query parameters and WHERE conditions independently.
 * @param query The normalized rides query.
 * @returns A promise resolving to the matching rides.
 */
export async function findRidesByQuery(query: GetRidesQuery): Promise<Ride[]> {
	//

	//
	// Validate the query.

	const validatedQuery = GetRidesQuerySchema.parse(query);

	//
	// Build the query parameters and WHERE conditions independently.

	const params: Record<string, number | string> = {};
	const conditions: string[] = [];

	let paramIndex = 1;

	//
	// Helper for adding a parameter.

	const addParam = (value: number | string): string => {
		const index = paramIndex++;
		params[String(index)] = value;
		return `$${index}`;
	};

	//
	// Scheduled start time range.

	conditions.push(
		`start_time_scheduled >= ${addParam(validatedQuery.start_time_scheduled_start)}`,
	);

	conditions.push(
		`start_time_scheduled <= ${addParam(validatedQuery.start_time_scheduled_end)}`,
	);

	//
	// Agency IDs

	if (validatedQuery.agency_ids.length) {
		const placeholders = validatedQuery.agency_ids.map(addParam);
		conditions.push(`agency_id IN (${placeholders.join(', ')})`);
	}

	//
	// Route short names

	if (validatedQuery.route_short_names?.length) {
		const placeholders = validatedQuery.route_short_names.map(addParam);
		conditions.push(`route_short_name IN (${placeholders.join(', ')})`);
	}

	//
	// Stop IDs

	if (validatedQuery.stop_ids?.length) {
		const placeholders = validatedQuery.stop_ids.map(addParam);
		conditions.push(`stop_id IN (${placeholders.join(', ')})`);
	}

	//
	// Acceptance statuses

	if (validatedQuery.acceptance_statuses?.length) {
		const placeholders = validatedQuery.acceptance_statuses.map(addParam);
		conditions.push(`acceptance_status IN (${placeholders.join(', ')})`);
	}

	//
	// Delay statuses

	if (validatedQuery.delay_statuses?.length) {
		const placeholders = validatedQuery.delay_statuses.map(addParam);
		conditions.push(`delay_status IN (${placeholders.join(', ')})`);
	}

	//
	// Operational statuses

	if (validatedQuery.operational_statuses?.length) {
		const placeholders = validatedQuery.operational_statuses.map(addParam);
		conditions.push(`operational_status IN (${placeholders.join(', ')})`);
	}

	//
	// Seen statuses

	if (validatedQuery.seen_statuses?.length) {
		const placeholders = validatedQuery.seen_statuses.map(addParam);
		conditions.push(`seen_status IN (${placeholders.join(', ')})`);
	}

	//
	// Ticketing statuses

	if (validatedQuery.ticketing_statuses?.length) {
		const placeholders = validatedQuery.ticketing_statuses.map(addParam);
		conditions.push(`ticketing_status IN (${placeholders.join(', ')})`);
	}

	//
	// Analysis grades

	if (validatedQuery.analysis_at_least_one_vehicle_event_on_last_stop_grade?.length) {
		// const placeholders = validatedQuery.analysis_at_least_one_vehicle_event_on_last_stop_grade.map(addParam);
		// conditions.push(`analysis_ended_at_last_stop_grade IN (${placeholders.join(', ')})`);
	}

	if (validatedQuery.analysis_expected_apex_validation_interval_grade?.length) {
		// const placeholders = validatedQuery.analysis_expected_apex_validation_interval_grade.map(addParam);
		// conditions.push(`analysis_expected_apex_validation_interval IN (${placeholders.join(', ')})`);
	}

	if (validatedQuery.analysis_simple_three_vehicle_events_grade?.length) {
		// const placeholders = validatedQuery.analysis_simple_three_vehicle_events_grade.map(addParam);
		// conditions.push(`analysis_simple_three_vehicle_events_grade IN (${placeholders.join(', ')})`);
	}

	if (validatedQuery.analysis_transaction_sequentiality_grades?.length) {
		// const placeholders = validatedQuery.analysis_transaction_sequentiality_grades.map(addParam);
		// conditions.push(`analysis_transaction_sequentiality IN (${placeholders.join(', ')})`);
	}

	//
	// Search

	if (validatedQuery.search) {
		const search = addParam(`%${validatedQuery.search}%`);
		conditions.push(`
			(
				toString(_id) ILIKE ${search}
				OR toString(headsign) ILIKE ${search}
				OR toString(route_long_name) ILIKE ${search}
			)
		`);
	}

	//
	// Build the final query.

	const where = conditions.join('\n\t\t\tAND ');

	const selectResult = await labDb.operation.rides.queryFromString(
		`
			SELECT *
			FROM operation.rides FINAL
			WHERE ${where}
		`,
		params,
	);

	//
	// Return the matching rides.

	return selectResult ?? [];
}
