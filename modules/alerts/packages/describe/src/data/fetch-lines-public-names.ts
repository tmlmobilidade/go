/* * */

import { type AlertsDescribeRequest } from '@tmlmobilidade/go-alerts-pckg-types';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';

/* * */

const fetchLinesPublicNamesQuery = `
  SELECT public_name
  FROM lines
  WHERE id IN ($1)
`;

/**
 * Extracts the lines public names from the request.
 * @param request The request data.
 * @returns The lines public names.
 */
export async function fetchLinesPublicNames(request: AlertsDescribeRequest): Promise<string[]> {
	//

	const params = request.references_data.map(reference => `'${reference.parent_id}'`).join(',');

	const foundLines = await labDb.queryFromString(fetchLinesPublicNamesQuery, params);

	if (!foundAgency) throw new Error(`Agency ${request.agency_id} not found in database.`);

	if (!foundAgency.public_name) return foundAgency.name;
	else return foundAgency.public_name;
}
