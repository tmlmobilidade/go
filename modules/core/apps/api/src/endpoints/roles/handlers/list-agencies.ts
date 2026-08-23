/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Agency } from '@tmlmobilidade/go-types-core';

/**
 * Returns all Roles sorted by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<Agency[]>) {
	//

	const foundAgencies = await goDb.core.agencies.findMany();

	if (!foundAgencies?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No roles found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundAgencies);
}
