/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiRoute } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves all routes from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getRoutesHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiRoute[]>) {
	//

	const cachedData = await cacheDb.get('hub:v1:network:routes');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/network:getRoutes()] No cached data found for routes' });
		return sendErrorApiResponse(reply, {
			error: '[hub/v1/network:getRoutes()] No cached data found for routes',
			status_code: '404',
		});
	};

	return sendSuccessApiResponse(reply, JSON.parse(cachedData), {
		max_age: '1h',
	});
}
