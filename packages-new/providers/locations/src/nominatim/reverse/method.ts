/* * */

import { type NominatimReverseRequest, NominatimReverseRequestSchema } from './reverse-request.js';
import { type NominatimReverseResponse, NominatimReverseResponseSchema } from './reverse-response.js';

/**
 * Performs a reverse lookup using the Nominatim API.
 * Use this method to get OSM information from a given latitude and longitude.
 * @param params The request parameters.
 * @returns The reverse lookup response.
 * @throws If the request parameters or the API response are invalid.
 */
export async function reverse(params: NominatimReverseRequest): Promise<NominatimReverseResponse> {
	//

	const validatedParams = NominatimReverseRequestSchema.parse(params);

	//
	// Setup the URL request

	const url = new URL('https://nominatim.go.tmlmobilidade.pt/reverse');

	url.searchParams.set('format', 'jsonv2');

	url.searchParams.set('lat', String(validatedParams.latitude));
	url.searchParams.set('lon', String(validatedParams.longitude));

	//
	// Perform the request and validate the response

	return fetch(url)
		.then(response => response.json())
		.then(data => NominatimReverseResponseSchema.parse(data));
}
