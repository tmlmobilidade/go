/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type DemandByAgencyByOperationalDate } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the demand by agency by operational date JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getDemandByAgencyByOperationalDateHandler(request: FastifyRequest, reply: FastifyReply<DemandByAgencyByOperationalDate>) {
	//

	//
	// Get the published data from the cache

	const cachedData = await cacheDb.get('hub:v1:metrics:demand:by-agency:by-operational-date:json');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/metrics:getDemandByAgencyByOperationalDateHandler()] No data in cache.' });
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=15')
			.code(HTTP_STATUS.NO_CONTENT)
			.send({
				data: [],
				error: null,
				status_code: HTTP_STATUS.NO_CONTENT,
			});
	}

	//
	// Return the parsed data

	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=15')
		.code(HTTP_STATUS.OK)
		.send({
			data: JSON.parse(cachedData),
			error: null,
			status_code: HTTP_STATUS.OK,
		});
}
