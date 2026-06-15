/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the vehicle metadata JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getVehicleMetadataJson(request: FastifyRequest, reply: FastifyReply<unknown>) {
	const raw = await apiCache.get('hub:realtime:vehicles:metadata:json');
	if (!raw) {
		Logger.error('[hub/v1/realtime:getVehicleMetadataJson()] No data in cache.');
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.code(HTTP_STATUS.NO_CONTENT)
			.send({
				data: [],
				error: null,
				status_code: HTTP_STATUS.NO_CONTENT,
			});
	}
	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=5')
		.code(HTTP_STATUS.OK)
		.send(JSON.parse(raw));
}
