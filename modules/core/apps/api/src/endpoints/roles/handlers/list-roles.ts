/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Role } from '@tmlmobilidade/go-types-core';

/**
 * Returns all Roles sorted by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function listRolesHandler(request: FastifyRequest, reply: FastifyReply<Role[]>) {
	//

	const foundRoles = await goDb.core.roles.findMany();

	if (!foundRoles?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No roles found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundRoles);
}
