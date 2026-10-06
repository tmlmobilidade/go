/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { encodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';

/**
 * Retrieves the trip updates GTFS RT Protobuf data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getEtaGtfsRtProtobufHandler(request: FastifyRequest<{ Params: { organizationId: string } }>, reply: FastifyReply<unknown>) {
	//

	//
	// Get the published feed from the cache

	const cachedData = await cacheDb.get(getOrganizationCacheKey(request.params.organizationId, 'eta:all:gtfs'));

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/eta:getTripUpdatesGtfsRtProtobufHandler()] No data in cache.' });
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
