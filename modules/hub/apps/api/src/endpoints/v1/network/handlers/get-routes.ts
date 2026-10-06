/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiRoute } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Retrieves all routes from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getRoutesHandler(request: FastifyRequest<{ Params: { organizationId: string } }>, reply: FastifyReply<HubV1ApiRoute[]>) {
	//

	//
	// Get the published routes from the cache

	const cachedData = await cacheDb.get(getOrganizationCacheKey(request.params.organizationId, 'network:routes'));

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/network:getRoutesHandler()] No cached data found for routes' });
		return sendErrorApiResponse(reply, {
			error: '[hub/v1/network:getRoutesHandler()] No cached data found for routes',
			status_code: '404',
		});
	}

	//
	// Return the parsed routes

	return sendSuccessApiResponse(reply, JSON.parse(cachedData), {
		max_age: '1h',
	});
}
