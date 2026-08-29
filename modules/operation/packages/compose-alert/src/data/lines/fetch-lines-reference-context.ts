/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type AlertsComposeRequest } from '@tmlmobilidade/go-operation-pckg-types';

import { type FetchLinesReferenceContextItem } from './fetch-lines-reference-context-item.js';
import { fetchLinesReferenceContextQuery } from './fetch-lines-reference-context-query.js';

/**
 * Extracts the lines public names from the request.
 * @param request The request data.
 * @returns The lines public names.
 */
export async function fetchLinesReferenceContext(request: AlertsComposeRequest): Promise<string[]> {
	//

	//
	// Build the query parameters from the request data

	const params: Record<string, number | string | string[]> = {
		1: request.agency_id,
		2: request.active_period_start_date,
		3: request.active_period_end_date,
		4: request.references.map(reference => reference.parent_id),
	};

	//
	// Execute the query and return the lines public names

	const queryResult = await labDb.queryFromString<FetchLinesReferenceContextItem>(fetchLinesReferenceContextQuery, params);

	if (!queryResult?.length) throw new Error(`No lines found for the request.`);

	return queryResult.map(item => `Line Short Name: ${item.route_short_name} - Line Long Name: ${item.route_long_name}`);
}
