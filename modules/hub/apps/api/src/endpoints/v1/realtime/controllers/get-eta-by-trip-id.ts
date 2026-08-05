/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves trip stop ETAs for a trip from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getEtaByTripId(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<unknown>) {
	const raw = await cacheDb.get(`hub:v1:realtime:eta:by-trip:${request.params.id}`);

	if (!raw) {
		Logger.error({ message: `[hub/v1/realtime:getEtaByTripJson(${request.params.id})] No data in cache.` });
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
		.send({
			data: JSON.parse(raw),
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}
