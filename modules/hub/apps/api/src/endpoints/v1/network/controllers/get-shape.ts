/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';
import { type HubShape } from '@tmlmobilidade/types';

/**
 * Retrieves a shape by its ID from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getShape(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<HubShape>) {
	//

	const cachedData = await apiCache.get(`hub:v1:network:shapes:${request.params.id}`);

	if (!cachedData) {
		Logger.error(`[hub/v1/network:getShapes(${request.params.id})] No cached data found for shape ${request.params.id}`);
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
