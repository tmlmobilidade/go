/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateRoleDto, type Role } from '@tmlmobilidade/go-types-core';

/**
 * Create a new role in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function createRoleHandler(request: FastifyRequest<{ Body: CreateRoleDto }>, reply: FastifyReply<Role>) {
	//

	//
	// Set the created_by and updated_by fields to the current user's id

	request.body.created_by = request.me._id;
	request.body.updated_by = request.me._id;

	const role = await goDb.core.roles.insertOne(request.body);

	if (!role) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Error creating role');
	}

	reply.send({ data: role, error: null, statusCode: HTTP_STATUS.CREATED });
}
