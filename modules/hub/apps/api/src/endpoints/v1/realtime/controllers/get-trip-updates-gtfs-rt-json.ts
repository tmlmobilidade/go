/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { getEmptyGtfsRtFeedMessage } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the trip updates GTFS RT JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getTripUpdatesGtfsRtJson(request: FastifyRequest, reply: FastifyReply<unknown>) {
	const raw = await apiCache.get('hub:v1:realtime:eta:gtfs');
	if (!raw) {
		Logger.error({ message: '[hub/v1/realtime:getTripUpdatesGtfsRtJson()] No data in cache.' });
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
