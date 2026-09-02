/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the vehicle positions JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getVehiclePositionsJson(request: FastifyRequest, reply: FastifyReply<string>) {
	//

	const cachedData = await cacheDb.get('hub:v1:realtime:vehicles:positions:json');

	reply.header('access-control-allow-origin', '*');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/realtime:getVehiclePositionsJson()] No cached data found for vehicles positions' });
		return sendErrorApiResponse(reply, {
			error: 'No cached data found for vehicles positions',
			max_age: '30s',
			status_code: '404',
		});
	};

	return sendSuccessApiResponse(reply, JSON.parse(cachedData), { max_age: '3s' });
}
