/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiRoute } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves a route by its ID from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getRouteHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<HubV1ApiRoute>) {
	//

	const cachedData = await cacheDb.getNew<HubV1ApiRoute>(`hub:v1:network:routes:${request.params.id}`);

	if (!cachedData) {
		Logger.error({ message: `[hub/v1/network:getRoute(${request.params.id})] No cached data found for route ${request.params.id}` });
		return sendErrorApiResponse(reply, {
			error: `[hub/v1/network:getRoute(${request.params.id})] No cached data found for route ${request.params.id}`,
			status_code: '404',
		});
	};

	return sendSuccessApiResponse(reply, cachedData.data, {
		max_age: '1h',
	});
}
