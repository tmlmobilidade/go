/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Agency } from '@tmlmobilidade/go-types-core';

/**
 * Returns an Agency by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getAgencyHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Agency>) {
	//

	//
	// Get the agency data

	const foundAgency = await goDb.core.agencies.findById(request.params.id);

	if (!foundAgency) {
		return sendErrorApiResponse(reply, {
			error: `Agency with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundAgency);
}
