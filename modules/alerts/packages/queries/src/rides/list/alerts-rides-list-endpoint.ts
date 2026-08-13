/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type ControllerRidesListFilters, ControllerRidesListFiltersSchema } from './alerts-rides-list-filters.js';
import { type ControllerRidesListItem } from './alerts-rides-list-item.js';
import { alertsRidesListQuery } from './alerts-rides-list-query.js';

/* * */

export async function getControllerRidesList(filters: ControllerRidesListFilters): Promise<ControllerRidesListItem	[]> {
	//

	//
	// Validate the filters

	const validatedFilters = ControllerRidesListFiltersSchema.parse(filters);

	//
	// If any of the required filters are empty arrays,
	// then there is no data to return, so return an empty array.

	const hasEmptyFilter = [
		validatedFilters.agency_ids,
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
		conditions.push(`agency_id IN (${placeholders.join(', ')})`);
	}

	//
	// Append the dynamic filters to the query

	const where = conditions.length
		? `\n\tAND ${conditions.join('\n\tAND ')}`
		: '';

	const sql = alertsRidesListQuery.replace('--DYNAMIC FILTERS HERE--', where);

	return await labDb.operation.rides.queryFromString(sql, params);
}
