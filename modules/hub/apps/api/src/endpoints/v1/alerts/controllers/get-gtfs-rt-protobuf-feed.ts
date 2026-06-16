/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { encodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Returns a GTFS-RT Protobuf feed with service alerts.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getGtfsRtProtobufFeed(request: FastifyRequest, reply: FastifyReply<Buffer>) {
	//

	const cachedData = await apiCache.get('hub:v1:alerts:published:gtfs');

	if (!cachedData) {
		Logger.error('[hub/v1/alerts:getGtfsRtProtobufFeed()] No GTFS-RT feed found in cache. Returning empty message.');
		return reply
			.code(HTTP_STATUS.NO_CONTENT)
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=20')
			.send();
	};

	const cachedDataParsed = JSON.parse(cachedData);
	const encodedGtfsRtFeed = await encodeGtfsRtFeed(cachedDataParsed);

	return reply
		.code(HTTP_STATUS.OK)
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=20')
		.type('application/octet-stream')
		.send(encodedGtfsRtFeed);
}
