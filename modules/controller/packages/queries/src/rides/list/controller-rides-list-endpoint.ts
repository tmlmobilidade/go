/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type ControllerRidesListFilters, ControllerRidesListFiltersSchema } from './controller-rides-list-filters.js';
import { type ControllerRidesListItem, ControllerRidesListItemSchema } from './controller-rides-list-item.js';
import { controllerRidesListQuery } from './controller-rides-list-query.js';

/* * */

export async function getControllerRidesList(filters: ControllerRidesListFilters): Promise<ControllerRidesListItem	[]> {
	//

	//
	// Validate the filters

	const validatedFilters = ControllerRidesListFiltersSchema.parse(filters);

	//
	// Build query parameters

	const params: Record<string, number | string> = {
		1: validatedFilters.start_time_scheduled_start,
		2: validatedFilters.start_time_scheduled_end,
	};

	let paramIndex = 3;

	const addParam = (value: number | string): string => {
		const index = paramIndex++;
		params[String(index)] = value;
		return `$${index}`;
	};

	//
	// Build WHERE conditions

	const conditions: string[] = [];

	//
	// Agency IDs

	if (validatedFilters.agency_ids.length) {
		const placeholders = validatedFilters.agency_ids.map(addParam);
		conditions.push(
			`agency_id IN (${placeholders.join(', ')})`,
		);
	}

	//
	// Route short names

	if (validatedFilters.route_short_names?.length) {
		const placeholders = validatedFilters.route_short_names.map(addParam);
		conditions.push(
			`route_short_name IN (${placeholders.join(', ')})`,
		);
	}

	//
	// Driver IDs

	if (validatedFilters.driver_ids?.length) {
		const placeholders = validatedFilters.driver_ids.map(addParam);
		conditions.push(
			`hasAny(driver_ids, [${placeholders.join(', ')}])`,
		);
	}

	//
	// Vehicle IDs

	if (validatedFilters.vehicle_ids?.length) {
		const placeholders = validatedFilters.vehicle_ids.map(addParam);
		conditions.push(
			`hasAny(vehicle_ids, [${placeholders.join(', ')}])`,
		);
	}

	//
	// Operational statuses

	if (validatedFilters.operational_statuses?.length) {
		const placeholders = validatedFilters.operational_statuses.map(addParam);
		conditions.push(
			`operational_status IN (${placeholders.join(', ')})`,
		);
	}

	//
	// Seen statuses

	if (validatedFilters.seen_statuses?.length) {
		const placeholders = validatedFilters.seen_statuses.map(addParam);
		conditions.push(
			`seen_status IN (${placeholders.join(', ')})`,
		);
	}

	//
	// Delay statuses
	//
	// A nullable status filter can contain:
	//
	//   ['delayed', 'ontime']
	//
	// or:
	//
	//   [null, 'delayed']
	//
	// NULL must be handled separately because SQL NULL cannot be compared
	// with IN (...)

	if (validatedFilters.delay_statuses?.length) {
		const delayStatuses = validatedFilters.delay_statuses.filter(
			(status): status is NonNullable<typeof status> => status !== null,
		);
		const includesNull = validatedFilters.delay_statuses.includes(null);
		const delayConditions: string[] = [];
		if (delayStatuses.length) {
			const placeholders = delayStatuses.map(addParam);
			delayConditions.push(
				`start_delay_status IN (${placeholders.join(', ')})`,
			);
			delayConditions.push(
				`end_delay_status IN (${placeholders.join(', ')})`,
			);
		}
		if (includesNull) {
			delayConditions.push(
				`start_delay_status IS NULL`,
			);
			delayConditions.push(
				`end_delay_status IS NULL`,
			);
		}
		conditions.push(`
			(
				${delayConditions.join('\n\t\t\t\tOR ')}
			)
		`);
	}

	//
	// Analysis grades
	//
	// NULL is a meaningful filter value here:
	//
	//   NULL = analysis is unavailable / not applicable.
	//
	// Therefore it must be translated to IS NULL rather than IN (...)

	const addNullableGradeFilter = (column: string, values: Array<null | string>): void => {
		const grades = values.filter((grade): grade is NonNullable<typeof grade> => grade !== null);
		const includesNull = values.includes(null);
		const gradeConditions: string[] = [];
		if (grades.length) {
			const placeholders = grades.map(addParam);
			gradeConditions.push(`${column} IN (${placeholders.join(', ')})`);
		}
		if (includesNull) gradeConditions.push(`${column} IS NULL`);
		conditions.push(`
			(
				${gradeConditions.join('\n\t\t\t\tOR ')}
			)
		`);
	};

	if (validatedFilters.analysis_at_least_one_vehicle_event_on_last_stop_grades?.length) {
		addNullableGradeFilter('analysis_at_least_one_vehicle_event_on_last_stop_grade', validatedFilters.analysis_at_least_one_vehicle_event_on_last_stop_grades);
	}

	if (validatedFilters.analysis_expected_apex_validation_interval_grades?.length) {
		addNullableGradeFilter('analysis_expected_apex_validation_interval_grade', validatedFilters.analysis_expected_apex_validation_interval_grades);
	}

	if (validatedFilters.analysis_simple_three_vehicle_events_grades?.length) {
		addNullableGradeFilter('analysis_simple_three_vehicle_events_grade', validatedFilters.analysis_simple_three_vehicle_events_grades);
	}

	if (validatedFilters.analysis_transaction_sequentiality_grades?.length) {
		addNullableGradeFilter('analysis_transaction_sequentiality_grade', validatedFilters.analysis_transaction_sequentiality_grades);
	}

	//
	// Search

	if (validatedFilters.search) {
		const search = addParam(`%${validatedFilters.search}%`);
		conditions.push(`
			(
				_id ILIKE ${search}
				OR toString(headsign) ILIKE ${search}
			)
		`);
	}

	//
	// Append the dynamic filters to the query

	const where = conditions.length
		? `\n\tAND ${conditions.join('\n\tAND ')}`
		: '';
	const sql = `${controllerRidesListQuery}${where}\n\tORDER BY start_time_scheduled ASC`;

	//
	// Execute the query

	const result = await labDb.operation.rides.queryFromString(sql, params);

	//
	// Validate and return the result

	return ControllerRidesListItemSchema.array().parse(result ?? []);
}
