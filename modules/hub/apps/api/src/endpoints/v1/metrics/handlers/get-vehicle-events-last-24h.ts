/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiVehicleEventsLast24h } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Retrieves the count of vehicle events in the last 24 hours from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getVehicleEventsLast24hHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiVehicleEventsLast24h | null>) {
	//

	//
	// Get the published data from the cache

	reply.header('access-control-allow-origin', '*');
	reply.header('cache-control', 'public, max-age=15');

	const cachedData = await cacheDb.get('hub:v1:metrics:vehicle-events:last-24h:json');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/metrics:getVehicleEventsLast24hHandler()] No data in cache.' });
		return sendSuccessApiResponse(reply, null, { status_code: '204' });
	}

	//
	// Return the parsed data

	return sendSuccessApiResponse(reply, JSON.parse(cachedData));
}
