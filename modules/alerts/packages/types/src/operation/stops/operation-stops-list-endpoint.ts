/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type OperationStopsListFilters, OperationStopsListFiltersSchema } from './operation-stops-list-filters.js';
import { type OperationStopsListItem } from './operation-stops-list-item.js';
import { operationStopsListQuery } from './operation-stops-list-query.js';

/* * */

export async function getOperationStopsList(filters: OperationStopsListFilters): Promise<OperationStopsListItem	[]> {
	//

	//
	// Validate the filters

	const validatedFilters = OperationStopsListFiltersSchema.parse(filters);

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

	//
	// Build WHERE conditions

	const sql = operationStopsListQuery;

	return await labDb.queryFromString(sql, params);
}
