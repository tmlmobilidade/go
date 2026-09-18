/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Returns a GTFS-RT JSON feed with service alerts for Carris Metropolitana.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getGtfsRtJsonFeedHandler(request: FastifyRequest, reply: FastifyReply<GtfsRtFeedMessage>) {
	//

	//
	// Get the published feed from the cache

	const cachedData = await cacheDb.get('hub:v1:alerts:published:gtfs');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/alerts:getGtfsRtJsonFeedHandler()] No GTFS-RT feed found in cache. Returning empty message.' });
		return sendErrorApiResponse(reply, {
			error: 'No GTFS-RT feed found in cache.',
			status_code: '404',
		});
	}

	//
	// Return the parsed feed

	return sendSuccessApiResponse(reply, JSON.parse(cachedData), {
		max_age: '30s',
	});
}
