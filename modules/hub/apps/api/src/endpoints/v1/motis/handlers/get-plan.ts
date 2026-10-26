/* * */

import { fetchMotisJson } from '@/endpoints/v1/motis/motis-client.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type HubV1ApiMotisPlanQuery, HubV1ApiMotisPlanQuerySchema, type HubV1ApiMotisPlanResponse, HubV1ApiMotisPlanResponseSchema } from '@tmlmobilidade/go-types-hub';

/**
 * Proxies a validated route-planning request to MOTIS.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getPlanHandler(request: FastifyRequest<{ Querystring: HubV1ApiMotisPlanQuery }>, reply: FastifyReply<HubV1ApiMotisPlanResponse>) {
	//

	//
	// Validate the request query

	const validatedQuery = HubV1ApiMotisPlanQuerySchema.safeParse(request.query);

	if (!validatedQuery.success) {
		return sendErrorApiResponse(reply, {
			error: validatedQuery.error.message,
			status_code: '400',
		});
	}

	//
	// Request route-planning data from MOTIS

	const motisResponse = await fetchMotisJson('/api/v6/plan', validatedQuery.data, HubV1ApiMotisPlanResponseSchema);

	if (motisResponse.error) {
		return sendErrorApiResponse(reply, motisResponse);
	}

	//
	// Return the validated route-planning data

	return sendSuccessApiResponse(reply, motisResponse.data);
}
