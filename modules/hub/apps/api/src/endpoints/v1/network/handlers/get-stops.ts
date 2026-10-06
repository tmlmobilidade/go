/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Retrieves all stops from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getStopsHandler(request: FastifyRequest<{ Params: { organizationId: string } }>, reply: FastifyReply<HubV1ApiStop[]>) {
	//

	//
	// Get the published stops from the cache

	const cachedData = await cacheDb.get(getOrganizationCacheKey(request.params.organizationId, 'network:stops'));

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/network:getStopsHandler()] No cached data found for stops' });
		return sendErrorApiResponse(reply, {
			error: '[hub/v1/network:getStopsHandler()] No cached data found for stops',
			status_code: '404',
		});
	}

	//
	// Return the parsed stops

	return sendSuccessApiResponse(reply, JSON.parse(cachedData), {
		max_age: '1h',
	});
}
