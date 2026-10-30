/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type UpdateUserDto, UpdateUserSchema, type User } from '@tmlmobilidade/go-types-core';

import { toPublicUser } from '../public-user.js';

/**
 * Update a user in the database.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function updateUserHandler(request: FastifyRequest<{ Body: UpdateUserDto, Params: { id: string } }>, reply: FastifyReply<Omit<User, 'password_hash'>>) {
	// Set the updated_by field to the current user id
	request.body.updated_by = request.me._id;
	// Validate the request body against the UpdateUserDto schema
	const validatedUserData = UpdateUserSchema.omit({ password_hash: true }).strict().safeParse(request.body);
	if (!validatedUserData.success) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid user data', validatedUserData.error.errors);
	}

	// Update the user in the database
	const updateResult = await goDb.core.users.updateById(request.params.id, validatedUserData.data);
	// Send the updated user data back in the response
	reply.send({ data: toPublicUser(updateResult), error: null, statusCode: HTTP_STATUS.OK });
}
