/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type ControllerRidesListFilters, ControllerRidesListFiltersSchema } from './controller-rides-list-filters.js';
import { type ControllerRidesListItem } from './controller-rides-list-item.js';
import { controllerRidesListQuery } from './controller-rides-list-query.js';

/* * */

export async function getControllerRidesList(filters: ControllerRidesListFilters): Promise<ControllerRidesListItem	[]> {
	//

	//
	// Validate the filters

	const validatedFilters = ControllerRidesListFiltersSchema.parse(filters);

	//
	// If any of the filters are filled but are empty arrays,
	// then there is no data to return, so return an empty array.

	const hasEmptyFilter = [
		validatedFilters.agency_ids,
		validatedFilters.acceptance_statuses,
		validatedFilters.analysis_at_least_one_vehicle_event_on_last_stop_grades,
		validatedFilters.analysis_expected_apex_validation_interval_grades,
		validatedFilters.analysis_simple_three_vehicle_events_grades,
		validatedFilters.analysis_transaction_sequentiality_grades,
		validatedFilters.start_delay_statuses,
		validatedFilters.end_delay_statuses,
		validatedFilters.driver_ids,
		validatedFilters.operational_statuses,
		validatedFilters.route_short_names,
		validatedFilters.ticketing_statuses,
		validatedFilters.vehicle_ids,
	].some(value => Array.isArray(value) && value.length === 0);

	if (hasEmptyFilter) return [];

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

	if (validatedFilters.driver_ids) {
		conditions.push(`hasAny(driver_ids, [${addParam(validatedFilters.driver_ids)}])`);
	}

	//
	// Vehicle IDs

	if (validatedFilters.vehicle_ids) {
		conditions.push(`hasAny(vehicle_ids, [${addParam(validatedFilters.vehicle_ids)}])`);
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
	// Delay statuses
	//
	// `none` represents a NULL delay status in ClickHouse.
	//
	//   none          -> IS NULL
	//   delayed/...   -> IN (...)

	const addDelayStatusFilter = (column: string, values: Array<string>): void => {
		const statuses = values.filter(status => status !== 'none');
		const includesNone = values.includes('none');
		const delayConditions: string[] = [];
		if (statuses.length) {
			const placeholders = statuses.map(addParam);
			delayConditions.push(`${column} IN (${placeholders.join(', ')})`);
		}
		if (includesNone) delayConditions.push(`${column} IS NULL`);
		conditions.push(`(${delayConditions.join('\n\t\t\tOR ')})`);
	};

	if (validatedFilters.start_delay_statuses?.length) {
		addDelayStatusFilter('start_delay_status', validatedFilters.start_delay_statuses);
	}

	if (validatedFilters.end_delay_statuses?.length) {
		addDelayStatusFilter('end_delay_status', validatedFilters.end_delay_statuses);
	}

	//
	// Analysis grades
	//
	// `none` represents a NULL analysis grade in the database.
	//
	//   none          -> IS NULL
	//   pass/fail/... -> IN (...)

	const addGradeFilter = (column: string, values: Array<string>): void => {
		const grades = values.filter(grade => grade !== 'none');
		const includesNone = values.includes('none');
		const gradeConditions: string[] = [];
		if (grades.length) {
			const placeholders = grades.map(addParam);
			gradeConditions.push(`${column} IN (${placeholders.join(', ')})`);
		}
		if (includesNone) gradeConditions.push(`${column} IS NULL`);
		conditions.push(`(${gradeConditions.join('\n\t\t\tOR ')})`);
	};

	if (validatedFilters.analysis_at_least_one_vehicle_event_on_last_stop_grades?.length) {
		addGradeFilter('analysis_at_least_one_vehicle_event_on_last_stop_grade', validatedFilters.analysis_at_least_one_vehicle_event_on_last_stop_grades);
	}

	if (validatedFilters.analysis_expected_apex_validation_interval_grades?.length) {
		addGradeFilter('analysis_expected_apex_validation_interval_grade', validatedFilters.analysis_expected_apex_validation_interval_grades);
	}

	if (validatedFilters.analysis_simple_three_vehicle_events_grades?.length) {
		addGradeFilter('analysis_simple_three_vehicle_events_grade', validatedFilters.analysis_simple_three_vehicle_events_grades);
	}

	if (validatedFilters.analysis_transaction_sequentiality_grades?.length) {
		addGradeFilter('analysis_transaction_sequentiality_grade', validatedFilters.analysis_transaction_sequentiality_grades);
	}

	//
	// Search

	if (validatedFilters.search) {
		const search = validatedFilters.search.trim();
		const exactSearch = addParam(search);
		const partialSearch = addParam(`%${search}%`);
		conditions.push(`
			(
				_id = ${exactSearch}
				OR _id ILIKE ${partialSearch}
				OR headsign ILIKE ${partialSearch}
			)
		`);
	}

	//
	// Append the dynamic filters to the query

	const where = conditions.length
		? `\n\tAND ${conditions.join('\n\tAND ')}`
		: '';

	const sql = controllerRidesListQuery.replace('--DYNAMIC FILTERS HERE--', where);

	return await labDb.operation.rides.queryFromString(sql, params);
}
