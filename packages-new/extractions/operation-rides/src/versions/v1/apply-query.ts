/* * */

import { type OperationRidesV1ExtractionProperties } from '@tmlmobilidade/go-types-extractions';

import { operationRidesV1ExtractionQuery } from './query.js';

/* * */

export function getSqlAndParams(validatedFilters: OperationRidesV1ExtractionProperties): { params: Record<string, number | string | string[]>, sql: string } {
	return {
		params: {
			agency_ids: validatedFilters.agency_ids,
			start_time_scheduled_end: validatedFilters.start_time_scheduled_end,
			start_time_scheduled_start: validatedFilters.start_time_scheduled_start,
		},
		sql: operationRidesV1ExtractionQuery,
	};
}
