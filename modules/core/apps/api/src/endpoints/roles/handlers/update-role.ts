/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Role, type UpdateRoleDto } from '@tmlmobilidade/go-types-core';

/**
 * Update a role in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function updateRoleHandler(request: FastifyRequest<{ Body: UpdateRoleDto, Params: { id: string } }>, reply: FastifyReply<Role>) {
	//

	//
	// Set the updated_by field to the current user's id
	request.body.updated_by = request.me._id;

	const role = await goDb.core.roles.updateById(request.params.id, request.body);

	if (!role) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error updating role');
	}

	reply.send({ data: role, error: null, statusCode: HTTP_STATUS.OK });
}
