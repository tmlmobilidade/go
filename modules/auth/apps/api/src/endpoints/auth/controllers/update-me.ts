/* * */

import { HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AUTH_SESSION_COOKIE_NAME, authProvider } from '@tmlmobilidade/go-providers-auth';
import { UpdateUserDto, type User } from '@tmlmobilidade/types';

/**
 * Get the current user from the session token.
 * @param request The request object.
 * @param reply The reply object.
*/
export async function updateMe(request: FastifyRequest<{ Body: UpdateUserDto }>, reply: FastifyReply<User>) {
	const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];
	const userData = await authProvider.getUserFromSessionToken(sessionToken);

	// For now, only the preferences field is allowed to be updated by the current user
	const updatedUser = await goDb.core.users.updateById(userData._id, { preferences: request.body.preferences });
	if (!updatedUser) {
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update user');
	}

	reply.send({ data: updatedUser, error: null, statusCode: HTTP_STATUS.OK });
}
