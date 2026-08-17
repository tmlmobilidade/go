/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type OperationRidesListFilters, OperationRidesListFiltersSchema } from './operation-rides-list-filters.js';
import { type OperationRidesListItem } from './operation-rides-list-item.js';
import { operationRidesListQuery } from './operation-rides-list-query.js';

/* * */

export async function getOperationRidesList(filters: OperationRidesListFilters): Promise<OperationRidesListItem	[]> {
	//

	//
	// Validate the filters

	const validatedFilters = OperationRidesListFiltersSchema.parse(filters);

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

	return await labDb.queryFromString(operationRidesListQuery, params);
}
