/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { Logger } from '@tmlmobilidade/logger-logger-backend';

/**
 * Retrieves all trip stop ETAs from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getEtaAll(request: FastifyRequest, reply: FastifyReply<unknown>) {
	const raw = await cacheDb.get('hub:v1:realtime:eta:all');

	if (!raw) {
		Logger.error({ message: '[hub/v1/realtime:getTripStopEtasJson()] No data in cache.' });
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
