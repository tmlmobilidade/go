/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type HubLine } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves a pattern by its ID from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getPattern(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<HubLine[]>) {
	//

	const cachedData = await apiCache.get(`hub:v1:network:patterns:${request.params.id}`);

	if (!cachedData) {
		Logger.error({ message: `[hub/v1/network:getPatterns(${request.params.id})] No cached data found for pattern ${request.params.id}` });
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
