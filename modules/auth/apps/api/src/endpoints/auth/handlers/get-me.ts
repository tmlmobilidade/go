/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AUTH_SESSION_COOKIE_NAME, authProvider } from '@tmlmobilidade/go-providers-auth';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { type User } from '@tmlmobilidade/types';

/**
 * Get the current user from the session token.
 * @param request The request object
 * @param reply The reply object
 */
export async function getMeHandler(request: FastifyRequest, reply: FastifyReply<User>) {
	//

	//
	// Extract the session token from authentication cookie

	const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];

	//
	// Retrieve user data using the session token.
	// If the user is not found, log out the session token
	// and return an error response. Do this to force the user
	// to log in again and to avoid an infinite loop of trying
	// to get user data with an invalid session token.

	let userData: User;

	try {
		userData = await authProvider.getUserFromSessionToken(sessionToken);
		if (!userData) throw new Error('User not found');
	} catch {
		await authProvider.logout(sessionToken);
		reply.setCookie(AUTH_SESSION_COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax', secure: true });
		return sendErrorApiResponse(reply, { error: 'User not found', status_code: '401' });
	}

	//
	// Retrieve roles and permissions for the user
	// and merge them into the user data.

	userData.permissions = await authProvider.getPermissionsFromSessionToken(sessionToken);

	//
	// Send the user data back in the response.

	sendSuccessApiResponse(reply, userData);

	//
	// Add seen_last_at for this user asynchronously

	await goDb.core.users.updateById(userData._id, { seen_last_at: Dates.now('utc').unix_timestamp });

	//
}
