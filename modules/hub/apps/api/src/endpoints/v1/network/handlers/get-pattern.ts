/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves a pattern by its ID from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getPatternHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<HubV1ApiPattern[]>) {
	//

	const cachedData = await cacheDb.get(`hub:v1:network:patterns:${request.params.id}`);

	if (!cachedData) {
		Logger.error({ message: `[hub/v1/network:getPatterns(${request.params.id})] No cached data found for pattern ${request.params.id}` });
		return sendErrorApiResponse(reply, {
			error: `[hub/v1/network:getPatterns(${request.params.id})] No cached data found for pattern ${request.params.id}`,
			status_code: '404',
		});
	};

	return sendSuccessApiResponse(reply, JSON.parse(cachedData), {
		max_age: '1h',
	});
}
