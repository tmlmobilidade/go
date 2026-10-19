/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Role, type UpdateRoleDto } from '@tmlmobilidade/go-types-core';

/**
 * Update a role in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function updateRoleHandler(request: FastifyRequest<{ Body: UpdateRoleDto, Params: { id: string } }>, reply: FastifyReply<Role>) {
	//

	request.body.updated_by = request.me._id;

	const updatedRole = await goDb.core.roles.updateById(request.params.id, request.body);

	if (!updatedRole) {
		return sendErrorApiResponse(reply, {
			error: 'Role not found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, updatedRole);
}
