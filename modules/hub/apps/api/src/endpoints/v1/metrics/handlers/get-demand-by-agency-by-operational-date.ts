/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type DemandByAgencyByOperationalDate } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Retrieves the demand by agency by operational date JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getDemandByAgencyByOperationalDateHandler(request: FastifyRequest, reply: FastifyReply<DemandByAgencyByOperationalDate | null>) {
	//

	//
	// Get the published data from the cache

	reply.header('access-control-allow-origin', '*');
	reply.header('cache-control', 'public, max-age=15');

	const cachedData = await cacheDb.get('hub:v1:metrics:demand:by-agency:by-operational-date:json');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/metrics:getDemandByAgencyByOperationalDateHandler()] No data in cache.' });
		return sendSuccessApiResponse(reply, null, { status_code: '204' });
	}

	//
	// Return the parsed data

	return sendSuccessApiResponse(reply, JSON.parse(cachedData));
}
