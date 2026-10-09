/* * */

import { fetchMotisJson } from '@/endpoints/v1/motis/motis-client.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type HubV1ApiMotisGeocodeQuery, HubV1ApiMotisGeocodeQuerySchema, type HubV1ApiMotisGeocodeResponse, HubV1ApiMotisGeocodeResponseSchema } from '@tmlmobilidade/go-types-hub';

/**
 * Proxies a validated geocoding request to MOTIS.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getGeocodeHandler(request: FastifyRequest<{ Querystring: HubV1ApiMotisGeocodeQuery }>, reply: FastifyReply<HubV1ApiMotisGeocodeResponse>) {
	//

	//
	// Validate the request query

	const validatedQuery = HubV1ApiMotisGeocodeQuerySchema.safeParse(request.query);

	if (!validatedQuery.success) {
		return sendErrorApiResponse(reply, {
			error: validatedQuery.error.message,
			status_code: '400',
		});
	}

	//
	// Request geocoding data from MOTIS

	const motisResponse = await fetchMotisJson('/api/v1/geocode', validatedQuery.data, HubV1ApiMotisGeocodeResponseSchema);

	if (motisResponse.error) {
		return sendErrorApiResponse(reply, motisResponse);
	}

	//
	// Return the validated geocoding data

	return sendSuccessApiResponse(reply, motisResponse.data);
}
