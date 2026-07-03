/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { encodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the vehicle positions GTFS RT Protobuf data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getVehiclePositionsGtfsRtProtobuf(request: FastifyRequest, reply: FastifyReply<unknown>) {
	//

	const cachedData = await apiCache.get('hub:v1:realtime:vehicles:positions:gtfs');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/realtime:getVehiclePositionsGtfsRtJson()] No cached data found for vehicles positions' });
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.code(HTTP_STATUS.NO_CONTENT)
			.send({
				data: [],
				error: null,
				status_code: HTTP_STATUS.NO_CONTENT,
			});
	};

	const cachedDataJson = JSON.parse(cachedData) as GtfsRtFeedMessage;
	const buffer = await encodeGtfsRtFeed(cachedDataJson);

	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=3')
		.type('application/octet-stream')
		.code(HTTP_STATUS.OK)
		.send(Buffer.from(buffer));
}
