/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { getEmptyGtfsRtFeedMessage } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the trip updates GTFS RT JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getTripUpdatesGtfsRtJsonHandler(request: FastifyRequest, reply: FastifyReply<unknown>) {
	//

	//
	// Get the published data from the cache

	const cachedData = await cacheDb.get('hub:v1:realtime:eta:all:gtfs');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/realtime:getTripUpdatesGtfsRtJsonHandler()] No data in cache.' });
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.code(HTTP_STATUS.NO_CONTENT)
			.send({
				data: getEmptyGtfsRtFeedMessage(),
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
