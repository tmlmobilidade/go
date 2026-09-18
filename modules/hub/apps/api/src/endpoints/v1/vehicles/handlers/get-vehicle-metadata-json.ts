/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { HubV1ApiVehicleMetadata } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves the vehicle metadata JSON data from the cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getVehicleMetadataJsonHandler(request: FastifyRequest, reply: FastifyReply<HubV1ApiVehicleMetadata[]>) {
	//

	//
	// Get the published metadata from the cache

	const cachedData = await cacheDb.get('hub:v1:realtime:vehicles:metadata:json');

	if (!cachedData) {
		Logger.error({ message: '[hub/v1/realtime:getVehicleMetadataJsonHandler()] No data in cache.' });
		return reply
			.header('access-control-allow-origin', '*')
			.header('cache-control', 'public, max-age=5')
			.code(HTTP_STATUS.NO_CONTENT)
			.send({
				data: [],
				error: null,
				status_code: HTTP_STATUS.NO_CONTENT,
			});
	}

	//
	// Return the parsed metadata

	return reply
		.header('access-control-allow-origin', '*')
		.header('cache-control', 'public, max-age=5')
		.code(HTTP_STATUS.OK)
		.send(JSON.parse(cachedData));
}
