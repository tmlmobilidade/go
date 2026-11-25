/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AUTH_SESSION_COOKIE_NAME } from '@tmlmobilidade/go-types-core';

/**
 * Logout a user by clearing their session token cookie.
 */
export async function logoutHandler(request: FastifyRequest, reply: FastifyReply<void>) {
	//

	//
	// Extract the session token from the request cookies

	const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];

	if (!sessionToken) {
		return sendErrorApiResponse(reply, {
			error: 'Session token not found',
			status_code: '400',
		});
	}

	//
	// Delete the session from the database

	await goDb.core.sessions.deleteOne({ token: { $eq: sessionToken } });

	//
	// Clear the session token by expiring the cookie

	reply.setCookie(AUTH_SESSION_COOKIE_NAME, '', {
		httpOnly: true,
		maxAge: 0,
		path: '/',
		sameSite: 'lax',
		secure: true,
	});

	//
	// Send a success response

	return sendSuccessApiResponse(reply, undefined);
}
