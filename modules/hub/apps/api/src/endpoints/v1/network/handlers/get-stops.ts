/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves all stops from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getStopsHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiStop[]>) {
	//

	const cachedData = await cacheDb.get('hub:v1:network:stops');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/network:getStops()] No cached data found for stops' });
		return sendErrorApiResponse(reply, {
			error: '[hub/v1/network:getStops()] No cached data found for stops',
			status_code: '404',
		});
	};

	return sendSuccessApiResponse(reply, JSON.parse(cachedData), {
		max_age: '1h',
	});
}
