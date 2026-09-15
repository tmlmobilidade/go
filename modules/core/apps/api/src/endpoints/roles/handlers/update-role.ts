/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Role, type UpdateRoleDto, UpdateRoleSchema } from '@tmlmobilidade/go-types-core';

/**
 * Updates a Role in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function updateRoleHandler(request: FastifyRequest<{ Body: UpdateRoleDto, Params: { id: string } }>, reply: FastifyReply<Role>) {
	//

	//
	// Validate the request body

	const validatedRole = UpdateRoleSchema.safeParse({
		...request.body,
		updated_by: request.me._id,
	});

	if (!validatedRole.success) {
		return sendErrorApiResponse(reply, {
			error: validatedRole.error.message,
			status_code: '400',
		});
	}

	//
	// Update the role in the database

	const updatedRole = await goDb.core.roles.updateById(request.params.id, validatedRole.data);

	if (!updatedRole) {
		return sendErrorApiResponse(reply, {
			error: `Role with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, updatedRole);
}
