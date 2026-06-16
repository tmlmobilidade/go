/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the vehicle positions GTFS RT Protobuf data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getVehiclePositionsGtfsRtProtobuf(request: FastifyRequest, reply: FastifyReply<unknown>) {
	const raw = await apiCache.get('hub:v1:realtime:vehicles:positions:gtfs');
	if (!raw) {
		Logger.error('[hub/v1/realtime:getVehiclePositionsGtfsRtProtobuf()] No data in cache.');
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.code(HTTP_STATUS.NO_CONTENT)
			.send();
	}
	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=3')
		.type('application/octet-stream')
		.code(HTTP_STATUS.OK)
		.send(Buffer.from(raw));
}
