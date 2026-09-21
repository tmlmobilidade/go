/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { encodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Retrieves a GTFS-RT TripUpdate protobuf feed for a trip from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getEtaByTripIdGtfsProtobufHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<unknown>) {
	//

	//
	// Get the published feed from the cache

	const cachedData = await cacheDb.get(`hub:v1:realtime:eta:by-trip:${request.params.id}:gtfs`);

	if (!cachedData) {
		Logger.error({ message: `[hub/v1/realtime:getEtaByTripIdGtfsProtobufHandler(${request.params.id})] No data in cache.` });
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.code(HTTP_STATUS.NO_CONTENT)
			.send();
	}

	//
	// Encode the feed into Protobuf and return it

	const buffer = await encodeGtfsRtFeed(JSON.parse(cachedData) as GtfsRtFeedMessage);

	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=5')
		.type('application/octet-stream')
		.code(HTTP_STATUS.OK)
		.send(Buffer.from(buffer));
}
