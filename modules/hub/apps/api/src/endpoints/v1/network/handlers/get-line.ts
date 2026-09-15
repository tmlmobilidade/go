/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiLine } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Retrieves a line by its ID from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getLineHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<HubV1ApiLine>) {
	//

	const cachedData = await cacheDb.getNew<HubV1ApiLine>(`hub:v1:network:lines:${request.params.id}`);

	if (!cachedData) {
		Logger.error({ message: `[hub/v1/network:getLine(${request.params.id})] No cached data found for line ${request.params.id}` });
		return sendErrorApiResponse(reply, {
			error: `[hub/v1/network:getLine(${request.params.id})] No cached data found for line ${request.params.id}`,
			status_code: '404',
		});
	};

	return sendSuccessApiResponse(reply, cachedData.data, {
		max_age: '1h',
	});
}
