/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { HubV1ApiTripStopEta } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves trip stop ETAs for a stop from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getEtaByStopIdHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<HubV1ApiTripStopEta[]>) {
	//

	//
	// Get the published data from the cache

	const cachedData = await cacheDb.get(`hub:v1:realtime:eta:by-stop:${request.params.id}`);

	if (!cachedData) {
		Logger.error({ message: `[hub/v1/realtime:getEtaByStopIdHandler(${request.params.id})] No data in cache.` });
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

	//
	// Return the parsed data

	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=5')
		.code(HTTP_STATUS.OK)
		.send({
			data: JSON.parse(cachedData),
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}
