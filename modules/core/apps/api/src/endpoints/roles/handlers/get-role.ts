/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Role } from '@tmlmobilidade/go-types-core';

/**
 * Returns a Role by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Role>) {
	//

	//
	// Get the role data

	const foundRole = await goDb.core.roles.findById(request.params.id);

	if (!foundRole) {
		return sendErrorApiResponse(reply, {
			error: `Role with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundRole);
}
