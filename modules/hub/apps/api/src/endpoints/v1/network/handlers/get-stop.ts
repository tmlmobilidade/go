/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves a stop by its ID from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getStopHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<HubV1ApiStop>) {
	//

	//
	// Get the published stop from the cache

	const cachedData = await cacheDb.getNew<HubV1ApiStop>(`hub:v1:network:stops:${request.params.id}`);

	if (!cachedData) {
		Logger.error({ message: `[hub/v1/network:getStopHandler(${request.params.id})] No cached data found for stop ${request.params.id}` });
		return sendErrorApiResponse(reply, {
			error: `[hub/v1/network:getStopHandler(${request.params.id})] No cached data found for stop ${request.params.id}`,
			status_code: '404',
		});
	}

	//
	// Return the cached stop

	return sendSuccessApiResponse(reply, cachedData.data, {
		max_age: '1h',
	});
}
