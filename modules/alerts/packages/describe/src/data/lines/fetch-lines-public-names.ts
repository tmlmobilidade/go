/* * */

import { type AlertsDescribeRequest } from '@tmlmobilidade/go-alerts-pckg-types';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type FetchLinesPublicNamesItem } from './fetch-lines-public-names-item.js';
import { fetchLinesPublicNamesQuery } from './fetch-lines-public-names-query.js';

/**
 * Extracts the lines public names from the request.
 * @param request The request data.
 * @returns The lines public names.
 */
export async function fetchLinesPublicNames(request: AlertsDescribeRequest): Promise<string[]> {
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
	// Execute the query and return the lines public names

	const queryResult = await labDb.queryFromString<FetchLinesPublicNamesItem>(fetchLinesPublicNamesQuery, params);

	if (!queryResult?.length) throw new Error(`No lines found for the request.`);

	return queryResult.map(item => `${item.route_short_name} - ${item.route_long_name}`);
}
