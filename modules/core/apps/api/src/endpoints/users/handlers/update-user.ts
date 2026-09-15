/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type UpdateUserDto, UpdateUserSchema, type User } from '@tmlmobilidade/go-types-core';

/**
 * Updates a User in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function updateUserHandler(request: FastifyRequest<{ Body: UpdateUserDto, Params: { id: string } }>, reply: FastifyReply<User>) {
	//

	//
	// Validate the request body

	const validatedUser = UpdateUserSchema.safeParse({
		...request.body,
		updated_by: request.me._id,
	});

	if (!validatedUser.success) {
		return sendErrorApiResponse(reply, {
			error: validatedUser.error.message,
			status_code: '400',
		});
	}

	//
	// Remove the password field if not provided to avoid
	// overwriting the existing password with an empty value

	if (!validatedUser.data.password_hash) delete validatedUser.data.password_hash;

	//
	// Update the user in the database

	const updatedUserData = await goDb.core.users.updateById(request.params.id, validatedUser.data);

	return sendSuccessApiResponse(reply, updatedUserData);
}
