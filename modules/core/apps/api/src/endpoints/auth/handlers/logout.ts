/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { AUTH_SESSION_COOKIE_NAME, authProvider } from '@tmlmobilidade/go-providers-auth';

/**
 * Logs out a user by clearing their session token cookie.
 * @param request The request object
 * @param reply The reply object
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
	// Log out the user through the auth provider

	await authProvider.logout(sessionToken);

	//
	// Clear the session token by expiring the cookie

	reply.setCookie(AUTH_SESSION_COOKIE_NAME, '', {
		httpOnly: true,
		maxAge: 0,
		path: '/',
		sameSite: 'lax',
		secure: true,
	});

	return sendSuccessApiResponse(reply, undefined);
}
