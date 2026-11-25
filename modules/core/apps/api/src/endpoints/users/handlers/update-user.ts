/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type UsersUpdateItemRequest, UsersUpdateItemRequestSchema, type UsersUpdateItemResponse, UsersUpdateItemResponseSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';

/**
 * Update a user in the database.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function updateUserHandler(request: FastifyRequest<{ Body: UsersUpdateItemRequest, Params: { id: string } }>, reply: FastifyReply<UsersUpdateItemResponse>) {
	//

	//
	// Validate the request body against the UpdateUserDto schema

	const validatedUserData = UsersUpdateItemRequestSchema.safeParse(request.body);

	if (!validatedUserData.success) {
		return sendErrorApiResponse(reply, { error: validatedUserData.error, status_code: '400' });
	}

	//
	// Update the user in the database

	const updateResult = await goDb.core.users.updateOne(
		{ _id: request.params.id },
		{ ...validatedUserData.data, updated_by: request.me._id },
	);

	//
	// Send the updated user data back in the response,
	// without the sensitive fields (password_hash, session_ids, verification_token_ids, etc.)

	const updateResultResponse = UsersUpdateItemResponseSchema.parse(updateResult);

	return sendSuccessApiResponse(reply, updateResultResponse);
}
