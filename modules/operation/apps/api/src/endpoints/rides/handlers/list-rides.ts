/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type ControllerRidesListFilters, ControllerRidesListFiltersSchema, type ControllerRidesListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { readFile } from 'node:fs/promises';

import { parseRidesListSearch } from '../utils/parse-rides-list-search.js';

/* * */

/**
 * Get rides by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listRidesHandler(request: FastifyRequest<{ Body: ControllerRidesListFilters }>, reply: FastifyReply<ControllerRidesListItem[]>) {
	//

	//
	// Apply permission filters to the request body

	request.body.agency_ids = filterPermissionResourceValues<string>({
		action: 'analysis_read',
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: 'rides',
		values: request.body.agency_ids,
	});

	//
	// Validate the filters

	const validatedFilters = ControllerRidesListFiltersSchema.parse(request.body);

	//
	// If any of the required filters are empty arrays,
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
		validatedFilters.operational_statuses,
		validatedFilters.route_short_names,
		validatedFilters.ticketing_statuses,
	].some(value => Array.isArray(value) && value.length === 0);

	if (hasEmptyFilter) return [];

	//
	// Parse search tags (`v:`, `d:`) and optional trip_id pattern (`%%`)

	const parsedSearch = parseRidesListSearch(validatedFilters.search);
	const search = parsedSearch.text;
	const isTripIdPattern = search?.includes('%%') ?? false;
	const exactRideSearch = search && !isTripIdPattern ? search : null;

	//
	// Build query parameters

	const params: Record<string, number | string> = {
		1: validatedFilters.start_time_scheduled_start,
		2: validatedFilters.start_time_scheduled_end,
	};

	// $3 is the exact-ride id and only exists in the query when a plain search term is given.
	if (exactRideSearch) params[3] = exactRideSearch;

	let paramIndex = 4;

	const addParam = (value: number | string): string => {
		const index = paramIndex++;
		params[String(index)] = value;
		return `$${index}`;
	};

	//
	// Build WHERE conditions
	//
	// The SQL template has three injection points:
	//
	//   --RIDE FILTERS HERE--      inside the read of operation.rides, before the latest
	//                              version is selected. Only attributes that are identical
	//                              across every version of a ride may go here (agency, route,
	//                              id/headsign/trip_id search), so the primary key can prune
	//                              the read.
	//   --ANALYSIS FILTERS HERE--  inside each analysis read (agency only).
	//   --DERIVED FILTERS HERE--   after deduplication and status derivation, for attributes
	//                              that change between versions (driver/vehicle ids) and for
	//                              every derived status or grade.

	const rideConditions: string[] = [];
	const conditions: string[] = [];

	//
	// Agency IDs

	if (validatedFilters.agency_ids.length) {
		const placeholders = validatedFilters.agency_ids.map(addParam);
		rideConditions.push(`agency_id IN (${placeholders.join(', ')})`);
	}

	//
	// Route short names (filter UI + `r:` search tag)

	const routeShortNames = [
		...(validatedFilters.route_short_names ?? []),
		...parsedSearch.routeShortNames,
	];

	if (routeShortNames.length) {
		const placeholders = routeShortNames.map(addParam);
		rideConditions.push(`route_short_name IN (${placeholders.join(', ')})`);
	}

	//
	// Driver IDs (filter UI + `d:` search tag)

	const driverIds = [
		...(validatedFilters.driver_ids ?? []),
		...parsedSearch.driverIds,
	];

	if (driverIds.length) {
		const placeholders = driverIds.map(addParam);
		conditions.push(`hasAny(driver_ids, [${placeholders.join(', ')}])`);
	}

	//
	// Vehicle IDs (filter UI + `v:` search tag)

	const vehicleIds = [
		...(validatedFilters.vehicle_ids ?? []),
		...parsedSearch.vehicleIds,
	];

	if (vehicleIds.length) {
		const placeholders = vehicleIds.map(addParam);
		conditions.push(`hasAny(vehicle_ids, [${placeholders.join(', ')}])`);
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
	//
	//   `%%` in the remaining text → anchored trip_id pattern (`%%` = any sequence)
	//   otherwise → partial match on _id / headsign (+ exact-ride branch outside the date range)

	if (search) {
		if (isTripIdPattern) {
			const pattern = `^${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replaceAll('%%', '.*')}$`;
			rideConditions.push(`match(trip_id, ${addParam(pattern)})`);
		} else {
			const partialSearch = addParam(`%${search}%`);
			rideConditions.push(`(_id ILIKE ${partialSearch} OR headsign ILIKE ${partialSearch})`);
		}
	}

	//
	// Assemble the query.
	//
	// The exact-ride branch (a UNION ALL that adds the ride whose id is exactly the search
	// term, even outside the date range) is a scan of every part of operation.rides because
	// _id is the last column of the sorting key. It is only kept when there is a plain
	// (non-pattern) search term. The ride filters are applied to that branch as well, so
	// permission filters still hold.

	const joinConditions = (items: string[]): string => (items.length ? `\n\t\t\t\tAND ${items.join('\n\t\t\t\tAND ')}` : '');

	const queryTemplate = await readFile(sqlPath('operation', 'rides/list-rides.sql'), 'utf-8');

	const sql = queryTemplate
		.replace(/--EXACT RIDE BRANCH START--([\s\S]*?)--EXACT RIDE BRANCH END--/, (_, branch: string) => (exactRideSearch ? branch : ''))
		.replaceAll('--RIDE FILTERS HERE--', joinConditions(rideConditions))
		.replace('--DERIVED FILTERS HERE--', joinConditions(conditions));

	const queryResult = await labDb.queryFromString<ControllerRidesListItem>(sql, params);

	//
	// Return the results

	return sendSuccessApiResponse(reply, queryResult);
}
