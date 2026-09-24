/* * */

import { type NominatimDetailsRequest, NominatimDetailsRequestSchema } from '../types/details-request.js';
import { type NominatimDetailsResponse, NominatimDetailsResponseSchema } from '../types/details-response.js';

/**
 * Performs a details lookup using the Nominatim API.
 * Use this method to get OSM information from a given OSM ID and type.
 * @param params The request parameters.
 * @returns The details lookup response.
 * @throws If the request parameters or the API response are invalid.
 */
export async function adminDetails(params: NominatimDetailsRequest): Promise<NominatimDetailsResponse> {
	//

	const validatedParams = NominatimDetailsRequestSchema.parse(params);

	//
	// Setup the URL request

	const url = new URL('https://nominatim.go.tmlmobilidade.pt/details');

	url.searchParams.set('format', 'json');
	url.searchParams.set('osmtype', validatedParams.osm_type);
	url.searchParams.set('osmid', String(validatedParams.osm_id));
	url.searchParams.set('addressdetails', validatedParams.include_address_details ? 'true' : 'false');

	//
	// Perform the request and validate the response

	return fetch(url)
		.then(response => response.json())
		.then(data => NominatimDetailsResponseSchema.parse(data));
}
