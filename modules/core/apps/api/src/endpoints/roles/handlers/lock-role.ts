/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Role } from '@tmlmobilidade/go-types-core';

/**
 * Toggles the lock status of a role by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function lockRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Role>) {
	await goDb.core.roles.toggleLockById(request.params.id);
	const foundRole = await goDb.core.roles.findById(request.params.id);
	if (!foundRole) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Role not found');
	}

	reply.send({ data: foundRole, error: null, statusCode: HTTP_STATUS.OK });
}
