/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AUTH_SESSION_COOKIE_NAME, authProvider } from '@tmlmobilidade/go-providers-auth';
import { type UpdateUserDto, type User } from '@tmlmobilidade/go-types-core';

/**
 * Get the current user from the session token.
 * @param request The request object.
 * @param reply The reply object.
*/
export async function updateMeHandler(request: FastifyRequest<{ Body: UpdateUserDto }>, reply: FastifyReply<User>) {
	//

	const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];

	if (!sessionToken) {
		return sendErrorApiResponse(reply, { error: 'Session token not found', status_code: '401' });
	}

	const userData = await authProvider.getUserFromSessionToken(sessionToken);

	// For now, only the preferences field is allowed to be updated by the current user

	const updatedUser = await goDb.core.users.updateById(userData._id, { preferences: request.body.preferences });

	if (!updatedUser) {
		return sendErrorApiResponse(reply, { error: 'Failed to update user', status_code: '500' });
	}

	return sendSuccessApiResponse(reply, updatedUser);
}
