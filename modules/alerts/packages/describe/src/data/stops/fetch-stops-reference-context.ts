/* * */

import { type AlertsDescribeRequest } from '@tmlmobilidade/go-alerts-pckg-types';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type FetchStopsReferenceContextItem } from './fetch-stops-reference-context-item.js';
import { fetchStopsReferenceContextQuery } from './fetch-stops-reference-context-query.js';

/**
 * Extracts the stops public names from the request.
 * @param request The request data.
 * @returns The stops public names.
 */
export async function fetchStopsReferenceContext(request: AlertsDescribeRequest): Promise<string[]> {
	//

	//
	// Build the query parameters from the request data

	const params: Record<string, number | string | string[]> = {
		1: request.agency_id,
		2: request.active_period_start_date,
		3: request.active_period_end_date,
		4: request.references_data.map(reference => reference.parent_id),
	};

	//
	// Execute the query and return the stops public names

	const queryResult = await labDb.queryFromString<FetchStopsReferenceContextItem>(fetchStopsReferenceContextQuery, params);

	if (!queryResult?.length) throw new Error(`No stops found for the request.`);

	return queryResult.map(item => item.stop_name);
}
