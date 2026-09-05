/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiLine } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves all lines from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getLinesHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiLine[]>) {
	//

	const cachedData = await cacheDb.get('hub:v1:network:lines');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/network:getLines()] No cached data found for lines' });
		return sendErrorApiResponse(reply, {
			error: '[hub/v1/network:getLines()] No cached data found for lines',
			status_code: '404',
		});
	};

	return sendSuccessApiResponse(reply, JSON.parse(cachedData), {
		max_age: '1h',
	});
}
