/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { HubStop } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger-logger-backend';

/**
 * Retrieves all stops from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getStops(request: FastifyRequest, reply: FastifyReply<HubStop[]>) {
	//

	const cachedData = await cacheDb.get('hub:v1:network:stops');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/network:getStops()] No cached data found for stops' });
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=60')
			.code(HTTP_STATUS.NO_CONTENT)
			.send({
				data: [],
				error: null,
				status_code: HTTP_STATUS.NO_CONTENT,
			});
	};

	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=3600')
		.code(HTTP_STATUS.OK)
		.send({
			data: JSON.parse(cachedData),
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}
