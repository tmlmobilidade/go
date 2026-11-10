/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
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
		return sendErrorApiResponse(reply, { error: 'Error creating role', status_code: '500' });
	}

	return sendSuccessApiResponse(reply, role, { status_code: '201' });
}
