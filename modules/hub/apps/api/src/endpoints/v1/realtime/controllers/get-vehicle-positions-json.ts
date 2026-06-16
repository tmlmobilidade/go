/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the vehicle positions JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getVehiclePositionsJson(request: FastifyRequest, reply: FastifyReply<unknown>) {
	//

	const cachedData = await apiCache.get('hub:v1:realtime:vehicles:positions:json');

	if (!cachedData) {
		Logger.error('[hub/v1/realtime:getVehiclePositionsJson()] No cached data found for vehicles positions');
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.code(HTTP_STATUS.NO_CONTENT)
			.send({
				data: [],
				error: null,
				status_code: HTTP_STATUS.NO_CONTENT,
			});
	};

	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=3')
		.code(HTTP_STATUS.OK)
		.send({
			data: JSON.parse(cachedData),
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}
