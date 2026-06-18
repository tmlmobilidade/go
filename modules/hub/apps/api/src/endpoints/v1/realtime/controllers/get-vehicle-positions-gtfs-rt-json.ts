/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { encodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/**
 * Retrieves the vehicle positions GTFS RT JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getVehiclePositionsGtfsRtJson(request: FastifyRequest, reply: FastifyReply<unknown>) {
	const raw = await apiCache.get('hub:v1:realtime:vehicles:positions:gtfs');
	if (!raw) {
		Logger.error({ message: '[hub/v1/realtime:getVehiclePositionsGtfsRtJson()] No data in cache.' });
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
	const allItemsData = JSON.parse(raw) as GtfsRtFeedMessage;
	const buffer = await encodeGtfsRtFeed(allItemsData);
	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=3')
		.type('application/octet-stream')
		.code(HTTP_STATUS.OK)
		.send(Buffer.from(buffer));
}
