/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type GetRidesQuery } from '@tmlmobilidade/go-types-operation';
import { type Ride } from '@tmlmobilidade/go-types-operation';

/**
 * Finds rides matching the provided query.
 * This function owns the ClickHouse-specific implementation of the
 * frontend/backend GetRidesQuery schema.
 * @param query The normalized rides query.
 * @returns A promise resolving to the matching rides.
 */
export async function findRidesByQuery(query: GetRidesQuery): Promise<Ride[]> {
	//

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
		`start_time_scheduled >= ${addParam(query.start_time_scheduled_start)}`,
	);

	conditions.push(
		`start_time_scheduled <= ${addParam(query.start_time_scheduled_end)}`,
	);

	//
	// Agency IDs

	if (query.agency_ids.length) {
		const placeholders = query.agency_ids.map(addParam);
		conditions.push(`agency_id IN (${placeholders.join(', ')})`);
	}

	//
	// Route short names

	if (query.route_short_names?.length) {
		const placeholders = query.route_short_names.map(addParam);
		conditions.push(`route_short_name IN (${placeholders.join(', ')})`);
	}

	//
	// Stop IDs

	if (query.stop_ids?.length) {
		const placeholders = query.stop_ids.map(addParam);
		conditions.push(`stop_id IN (${placeholders.join(', ')})`);
	}

	//
	// Acceptance statuses

	if (query.acceptance_statuses?.length) {
		const placeholders = query.acceptance_statuses.map(addParam);
		conditions.push(`acceptance_status IN (${placeholders.join(', ')})`);
	}

	//
	// Delay statuses

	if (query.delay_statuses?.length) {
		const placeholders = query.delay_statuses.map(addParam);
		conditions.push(`delay_status IN (${placeholders.join(', ')})`);
	}

	//
	// Operational statuses

	if (query.operational_statuses?.length) {
		const placeholders = query.operational_statuses.map(addParam);
		conditions.push(`operational_status IN (${placeholders.join(', ')})`);
	}

	//
	// Seen statuses

	if (query.seen_statuses?.length) {
		const placeholders = query.seen_statuses.map(addParam);
		conditions.push(`seen_status IN (${placeholders.join(', ')})`);
	}

	//
	// Ticketing statuses

	if (query.ticketing_statuses?.length) {
		const placeholders = query.ticketing_statuses.map(addParam);
		conditions.push(`ticketing_status IN (${placeholders.join(', ')})`);
	}

	//
	// Analysis grades

	if (query.analyses?.at_least_one_vehicle_event_on_last_stop_grade?.length) {
		const placeholders = query.analyses.at_least_one_vehicle_event_on_last_stop_grade.map(addParam);
		conditions.push(`analysis_ended_at_last_stop_grade IN (${placeholders.join(', ')})`);
	}

	if (query.analyses?.expected_apex_validation_interval_grade?.length) {
		const placeholders = query.analyses.expected_apex_validation_interval_grade.map(addParam);
		conditions.push(`analysis_expected_apex_validation_interval IN (${placeholders.join(', ')})`);
	}

	if (query.analyses?.simple_three_vehicle_events_grade?.length) {
		const placeholders = query.analyses.simple_three_vehicle_events_grade.map(addParam);
		conditions.push(`analysis_simple_three_vehicle_events_grade IN (${placeholders.join(', ')})`);
	}

	if (query.analyses?.transaction_sequentiality?.length) {
		const placeholders = query.analyses.transaction_sequentiality.map(addParam);
		conditions.push(`analysis_transaction_sequentiality IN (${placeholders.join(', ')})`);
	}

	//
	// Search

	if (query.search) {
		const search = addParam(`%${query.search}%`);

		conditions.push(`
			(
				toString(_id) ILIKE ${search}
				OR toString(vehicle_id) ILIKE ${search}
				OR toString(line_id) ILIKE ${search}
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
