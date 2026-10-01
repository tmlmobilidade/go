/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiAgency } from '@tmlmobilidade/go-types-hub';

/**
 * Returns all agencies.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiAgency[]>) {
	//

	//
	// Get the published agencies from the cache

	const cachedData = await cacheDb.getNew<HubV1ApiAgency[]>('hub:v1:agencies:json');

	//
	// Return the agencies

	return sendSuccessApiResponse(reply, cachedData?.data ?? [], {
		generated_at: cachedData?.timestamp,
		max_age: '1h',
	});
}
