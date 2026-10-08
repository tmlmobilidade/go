/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiRoute } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Retrieves a route by its ID from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getRouteHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<HubV1ApiRoute>) {
	//

	//
	// Get the published route from the cache

	const cachedData = await cacheDb.getNew<HubV1ApiRoute>(`hub:v1:network:routes:${request.params.id}`);

	if (!cachedData) {
		Logger.error({ message: `[hub/v1/network:getRouteHandler(${request.params.id})] No cached data found for route ${request.params.id}` });
		return sendErrorApiResponse(reply, {
			error: `[hub/v1/network:getRouteHandler(${request.params.id})] No cached data found for route ${request.params.id}`,
			status_code: '404',
		});
	}

	//
	// Return the cached route

	return sendSuccessApiResponse(reply, cachedData.data, {
		max_age: '1h',
	});
}
