/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiAlert } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Returns a JSON feed with service alerts.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getJsonFeed(request: FastifyRequest, reply: FastifyReply<HubV1ApiAlert[]>) {
	//

	const cachedData = await cacheDb.get('hub:v1:alerts:published:json');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/alerts:getJsonFeed()] No JSON feed found in cache. Returning empty array.' });
		return sendErrorApiResponse(reply, {
			error: 'No JSON feed found in cache.',
			status_code: '404',
		});
	};

	return sendSuccessApiResponse(reply, JSON.parse(cachedData), {
		max_age: '30s',
	});
}
