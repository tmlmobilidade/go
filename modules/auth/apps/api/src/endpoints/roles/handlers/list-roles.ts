/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Role } from '@tmlmobilidade/go-types-core';

/**
 * List all roles.
 * @param request The request object
 * @param reply The reply object
 */
export async function listRolesHandler(request: FastifyRequest, reply: FastifyReply<Role[]>) {
	const allRolesData = await goDb.core.roles.findMany({}, { sort: { name: 1 } });

	if (!allRolesData) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error getting roles');
	}

	reply.send({ data: allRolesData, error: null, statusCode: HTTP_STATUS.OK });
}
