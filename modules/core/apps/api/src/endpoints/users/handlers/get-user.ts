/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type User } from '@tmlmobilidade/go-types-core';

/**
 * Returns a User by ID.
 * @param request The request object
 * @param reply The reply object
 */
export async function getUserHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<User>) {
	//

	//
	// Get the user data

	const foundUser = await goDb.core.users.findById(request.params.id);

	if (!foundUser) {
		return sendErrorApiResponse(reply, {
			error: `User with ID ${request.params.id} not found`,
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, foundUser);
}
