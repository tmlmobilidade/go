/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateRoleDto, CreateRoleSchema, type Role } from '@tmlmobilidade/go-types-core';

/**
 * Inserts a new Role into the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function createRoleHandler(request: FastifyRequest<{ Body: CreateRoleDto }>, reply: FastifyReply<Role>) {
	//

	//
	// Validate the request body

	const validatedRole = CreateRoleSchema.safeParse({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	if (!validatedRole.success) {
		return sendErrorApiResponse(reply, {
			error: validatedRole.error.message,
			status_code: '400',
		});
	}

	//
	// Insert the role into the database

	const insertResult = await goDb.core.roles.insertOne(validatedRole.data);

	if (!insertResult) {
		return sendErrorApiResponse(reply, {
			error: 'Error creating role',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, insertResult, { status_code: '201' });
}
