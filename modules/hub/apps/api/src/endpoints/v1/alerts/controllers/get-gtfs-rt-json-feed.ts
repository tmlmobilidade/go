/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { getEmptyGtfsRtFeedMessage } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Returns a GTFS-RT JSON feed with service alerts for Carris Metropolitana.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getGtfsRtJsonFeed(request: FastifyRequest, reply: FastifyReply<GtfsRtFeedMessage>) {
	//

	const cachedData = await apiCache.get('hub:v1:alerts:published:gtfs');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/alerts:getGtfsRtJsonFeed()] No GTFS-RT feed found in cache. Returning empty message.' });
		return reply
			.code(HTTP_STATUS.NO_CONTENT)
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=20')
			.send({
				data: getEmptyGtfsRtFeedMessage(),
				error: null,
				status_code: HTTP_STATUS.NO_CONTENT,
			});
	};

	return reply
		.code(HTTP_STATUS.OK)
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=20')
		.send({
			data: JSON.parse(cachedData),
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}
