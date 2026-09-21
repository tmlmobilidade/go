/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { encodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Returns a GTFS-RT Protobuf feed with service alerts.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getGtfsRtProtobufFeedHandler(request: FastifyRequest, reply: FastifyReply<Buffer>) {
	//

	//
	// Get the published feed from the cache

	const cachedData = await cacheDb.get('hub:v1:alerts:published:gtfs');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/alerts:getGtfsRtProtobufFeedHandler()] No GTFS-RT feed found in cache. Returning empty message.' });
		return reply
			.code(HTTP_STATUS.NO_CONTENT)
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=20')
			.send();
	}

	//
	// Encode the feed into Protobuf and return it

	const cachedDataParsed = JSON.parse(cachedData);
	const encodedGtfsRtFeed = await encodeGtfsRtFeed(cachedDataParsed);

	return reply
		.code(HTTP_STATUS.OK)
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=20')
		.type('application/octet-stream')
		.send(encodedGtfsRtFeed);
}
