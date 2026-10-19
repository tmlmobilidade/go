/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Role } from '@tmlmobilidade/go-types-core';

/**
 * Get a role by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getRoleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Role>) {
	const role = await goDb.core.roles.findById(request.params.id);

	if (!role) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Role not found');
	}

	reply.send({ data: role, error: null, statusCode: HTTP_STATUS.OK });
}
