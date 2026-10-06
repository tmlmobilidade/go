/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Retrieves a pattern by its ID from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getPatternHandler(request: FastifyRequest<{ Params: { id: string, organizationId: string } }>, reply: FastifyReply<HubV1ApiPattern[]>) {
	//

	//
	// Get the published pattern from the cache

	const cachedData = await cacheDb.getNew<HubV1ApiPattern[]>(getOrganizationCacheKey(request.params.organizationId, `network:patterns:${request.params.id}`));

	if (!cachedData) {
		Logger.error({ message: `[hub/v1/network:getPatternHandler(${request.params.id})] No cached data found for pattern ${request.params.id}` });
		return sendErrorApiResponse(reply, {
			error: `[hub/v1/network:getPatternHandler(${request.params.id})] No cached data found for pattern ${request.params.id}`,
			status_code: '404',
		});
	}

	//
	// Return the cached pattern

	return sendSuccessApiResponse(reply, cachedData.data, {
		max_age: '1h',
	});
}
