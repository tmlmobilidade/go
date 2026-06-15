/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { type HubLine } from '@tmlmobilidade/types';

/**
 * Retrieves all routes from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getRoutes(request: FastifyRequest, reply: FastifyReply<HubLine[]>) {
	//

	const cachedData = await apiCache.get('hub:v1:network:routes');

	if (!cachedData) {
		Logger.error('[hub/v1/network:getRoutes()] No cached data found for routes');
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
