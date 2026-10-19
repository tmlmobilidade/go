/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { AUTH_SESSION_COOKIE_NAME, authProvider } from '@tmlmobilidade/go-providers-auth';

/**
 * Logout a user by clearing their session token cookie.
 */
export async function logoutHandler(request: FastifyRequest, reply: FastifyReply<void>) {
	// Extract the session token from the request cookies
	// and call the authProvider to log out the user.
	const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];
	if (!sessionToken) {
		return reply.send({ data: undefined, error: 'Session token not found', statusCode: HTTP_STATUS.BAD_REQUEST });
	}
	await authProvider.logout(sessionToken);
	// Clear the session token by expiring the cookie
	reply.setCookie(AUTH_SESSION_COOKIE_NAME, '', {
		httpOnly: true,
		maxAge: 0,
		path: '/',
		sameSite: 'lax',
		secure: true,
	});
	// Send a success response
	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
