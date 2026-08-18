/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type AlertsComposeRequest } from '@tmlmobilidade/go-alerts-pckg-types';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

import { type FetchRidesReferenceContextItem } from './fetch-rides-reference-context-item.js';
import { fetchRidesReferenceContextQuery } from './fetch-rides-reference-context-query.js';

/**
 * Extracts the rides public names from the request.
 * @param request The request data.
 * @returns The rides public names.
 */
export async function fetchRidesReferenceContext(request: AlertsComposeRequest): Promise<string[]> {
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

	const queryResult = await labDb.queryFromString<FetchRidesReferenceContextItem>(fetchRidesReferenceContextQuery, params);

	if (!queryResult?.length) throw new Error(`No rides found for the request.`);

	return queryResult.map((item) => {
		const formattedDate = Dates.fromUnixTimestamp(item.start_time_scheduled).toFormat('HH:mm');
		return `Trip of the line ${item.route_short_name} headed to ${item.headsign} departing at ${formattedDate}`;
	});
}
