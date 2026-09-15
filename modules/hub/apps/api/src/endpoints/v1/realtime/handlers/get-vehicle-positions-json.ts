/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiVehiclePosition } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the vehicle positions JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getVehiclePositionsJsonHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiVehiclePosition[]>) {
	//

	//
	// Get the published positions from the cache

	const cachedData = await cacheDb.getNew<HubV1ApiVehiclePosition[]>('hub:v1:realtime:vehicles:positions:json');

	reply.header('access-control-allow-origin', '*');

	if (!cachedData?.data) {
		Logger.error({ message: '[hub/v1/realtime:getVehiclePositionsJsonHandler()] No cached data found for vehicles positions' });
		return sendErrorApiResponse(reply, {
			error: 'No cached data found for vehicles positions',
			max_age: '30s',
			status_code: '404',
		});
	}

	//
	// Return the cached positions with their generation timestamp

	return sendSuccessApiResponse(reply, cachedData.data, {
		generated_at: cachedData.timestamp,
		max_age: '3s',
	});
}
