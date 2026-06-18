/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { type HubAlert } from '@tmlmobilidade/types';

/**
 * Returns a JSON feed with service alerts.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getJsonFeed(request: FastifyRequest, reply: FastifyReply<HubAlert[]>) {
	//

	const cachedData = await apiCache.get('hub:v1:alerts:published:json');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/alerts:getJsonFeed()] No JSON feed found in cache. Returning empty array.' });
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=20')
			.code(HTTP_STATUS.NO_CONTENT)
			.send({
				data: [],
				error: null,
				status_code: HTTP_STATUS.NO_CONTENT,
			});
	};

	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=20')
		.code(HTTP_STATUS.OK)
		.send({
			data: JSON.parse(cachedData),
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}
