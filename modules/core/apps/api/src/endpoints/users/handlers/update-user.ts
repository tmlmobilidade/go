/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type UpdateUserDto, UpdateUserSchema, type User } from '@tmlmobilidade/go-types-core';

/**
 * Update a user in the database.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function updateUserHandler(request: FastifyRequest<{ Body: UpdateUserDto, Params: { id: string } }>, reply: FastifyReply<User>) {
	// Set the updated_by field to the current user id
	request.body.updated_by = request.me._id;
	// Validate the request body against the UpdateUserDto schema
	const validatedUserData = UpdateUserSchema.safeParse(request.body);
	if (!validatedUserData.success) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid user data', validatedUserData.error.errors);
	}

	// Remove password field if not provided to avoid
	// overwriting existing password with undefined
	if (!validatedUserData.data.password_hash) delete validatedUserData.data.password_hash;
	// Update the user in the database
	const updateResult = await goDb.core.users.updateById(request.params.id, validatedUserData.data);
	// Send the updated user data back in the response
	reply.send({ data: updateResult, error: null, statusCode: HTTP_STATUS.OK });
}
