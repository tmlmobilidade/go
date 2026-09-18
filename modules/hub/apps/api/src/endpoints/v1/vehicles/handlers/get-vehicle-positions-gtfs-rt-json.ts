/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the vehicle positions GTFS RT JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getVehiclePositionsGtfsRtJsonHandler(request: FastifyRequest, reply: FastifyReply<unknown>) {
	//

	//
	// Get the published data from the cache

	const cachedData = await cacheDb.get('hub:v1:realtime:vehicles:positions:gtfs');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/realtime:getVehiclePositionsGtfsRtJsonHandler()] No cached data found for vehicles positions' });
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
		.header('cache-control', 'public, max-age=3')
		.code(HTTP_STATUS.OK)
		.send({
			data: JSON.parse(cachedData),
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}
