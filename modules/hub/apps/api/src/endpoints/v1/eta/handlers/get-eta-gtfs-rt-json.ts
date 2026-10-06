/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { HubV1ApiEtaGtfsFeed } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { getEmptyGtfsRtFeedMessage } from '@tmlmobilidade/gtfs-rt';

/**
 * Retrieves the trip updates GTFS RT JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getEtaGtfsRtJsonHandler(request: FastifyRequest<{ Params: { organizationId: string } }>, reply: FastifyReply<HubV1ApiEtaGtfsFeed>) {
	//

	//
	// Get the published data from the cache

	const cachedData = await cacheDb.get(getOrganizationCacheKey(request.params.organizationId, 'eta:all:gtfs'));

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/eta:getTripUpdatesGtfsRtJsonHandler()] No data in cache.' });
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
