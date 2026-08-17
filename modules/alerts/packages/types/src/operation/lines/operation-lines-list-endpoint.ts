/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type OperationLinesListFilters, OperationLinesListFiltersSchema } from './operation-lines-list-filters.js';
import { type OperationLinesListItem } from './operation-lines-list-item.js';
import { operationLinesListQuery } from './operation-lines-list-query.js';

/* * */

export async function getOperationLinesList(filters: OperationLinesListFilters): Promise<OperationLinesListItem	[]> {
	//

	//
	// Validate the filters

	const validatedFilters = OperationLinesListFiltersSchema.parse(filters);

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

	const sql = operationLinesListQuery;

	return await labDb.queryFromString(sql, params);
}
