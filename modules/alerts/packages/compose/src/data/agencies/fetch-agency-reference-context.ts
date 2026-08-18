/* * */

import { type AlertsComposeRequest } from '@tmlmobilidade/go-alerts-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Extracts the agency public name from the request.
 * @param request The request data.
 * @returns The agency public name.
 */
export async function fetchAgencyReferenceContext(request: AlertsComposeRequest): Promise<string> {
	//

	const foundAgency = await goDb.core.agencies.findById(request.agency_id);

	if (!foundAgency) throw new Error(`Agency ${request.agency_id} not found in database.`);

	if (!foundAgency.public_name) return `Agency Name: ${foundAgency.name}`;
	else return `Agency Name: ${foundAgency.public_name}`;
}
