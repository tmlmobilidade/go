/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
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
	// Parse search tags (`v:`, `d:`, `l:`) and optional trip_id pattern (`%%`)

	const parsedSearch = parseRidesListSearch(validatedFilters.search);
	const search = parsedSearch.text;
	const isTripIdPattern = search?.includes('%%') ?? false;
	const exactRideSearch = search && !isTripIdPattern ? search : null;

	//
	// If any of the required filters are empty arrays,
	// then there is no data to return — unless we have an exact-ride
	// search, which bypasses every UI filter except agency permissions.

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
		validatedFilters.ticketing_statuses,
	].some(value => Array.isArray(value) && value.length === 0);

	if (hasEmptyFilter && !exactRideSearch) return [];
	if (hasEmptyFilter && !validatedFilters.agency_ids.length) return [];

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
	// The SQL template has these injection points:
	//
	//   --RIDE FILTERS HERE--         inside the dated read of operation.rides, before the
	//                                 latest version is selected. Only attributes that are
	//                                 identical across every version of a ride may go here
	//                                 (agency, route, id/headsign/trip_id search).
	//   --EXACT RIDE FILTERS HERE--   agency only — an exact `_id` hit bypasses every other
	//                                 UI filter; permissions still hold.
	//   --DERIVED FILTERS HERE--      after deduplication and status derivation, for attributes
	//                                 that change between versions (driver/vehicle ids) and for
	//                                 every derived status or grade.
	//   --EXACT RIDE BYPASS--         `_id = $3 OR (…)` so the exact hit skips derived filters.

	const rideConditions: string[] = [];
	const exactRideConditions: string[] = [];
	const conditions: string[] = [];

	// Empty UI filters normally mean "match nothing". With an exact-ride search we still
	// want that one ride, so disable the dated branch and let the exact branch do the work.
	if (hasEmptyFilter) rideConditions.push('1 = 0');

	//
	// Agency IDs

	if (validatedFilters.agency_ids.length) {
		const placeholders = validatedFilters.agency_ids.map(addParam);
		const agencyCondition = `agency_id IN (${placeholders.join(', ')})`;
		rideConditions.push(agencyCondition);
		exactRideConditions.push(agencyCondition);
	}

	//
	// Route short names (filter UI + `l:` search tag)

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
	// (non-pattern) search term. Only the agency filter is applied there so permissions
	// still hold while every other UI filter is bypassed.

	const joinConditions = (items: string[]): string => (items.length ? `\n\t\t\t\tAND ${items.join('\n\t\t\t\tAND ')}` : '');

	const queryTemplate = await readFile(sqlPath('operation', 'rides/list-rides.sql'), 'utf-8');

	const sql = queryTemplate
		.replace(/--EXACT RIDE BRANCH START--([\s\S]*?)--EXACT RIDE BRANCH END--/, (_, branch: string) => (exactRideSearch ? branch : ''))
		.replace(/--EXACT RIDE BYPASS START--([\s\S]*?)--EXACT RIDE BYPASS END--/, (_, bypass: string) => (exactRideSearch ? bypass : ''))
		.replaceAll('--RIDE FILTERS HERE--', joinConditions(rideConditions))
		.replace('--EXACT RIDE FILTERS HERE--', joinConditions(exactRideConditions))
		.replace('--DERIVED FILTERS HERE--', joinConditions(conditions));

	let queryResult = await labDb.queryFromString<ControllerRidesListItem>(sql, params);

	//
	// Acceptance status lives in MongoDB (`ride-acceptances`), not ClickHouse.
	// Enrich and filter after the rides query. `none` means no acceptance document.
	// An exact `_id` search bypasses this filter too.

	if (validatedFilters.acceptance_statuses?.length) {
		const acceptances = await goDb.operation.rideAcceptances.findMany(
			{ _id: { $in: queryResult.map(ride => ride._id) } },
			{ projection: { acceptance_status: 1 } },
		);
		const statusByRideId = new Map(acceptances.map(acceptance => [acceptance._id, acceptance.acceptance_status]));

		const statuses = validatedFilters.acceptance_statuses.filter(status => status !== 'none');
		const includesNone = validatedFilters.acceptance_statuses.includes('none');

		queryResult = queryResult
			.map(ride => ({
				...ride,
				acceptance_status: statusByRideId.get(ride._id) ?? null,
			}))
			.filter((ride) => {
				if (exactRideSearch && ride._id === exactRideSearch) return true;
				if (ride.acceptance_status === null) return includesNone;
				return statuses.includes(ride.acceptance_status);
			});
	}

	//
	// Return the results

	return sendSuccessApiResponse(reply, queryResult);
}
