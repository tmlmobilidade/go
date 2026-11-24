/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { AUTH_SESSION_COOKIE_NAME } from '@tmlmobilidade/go-types-core';
import { type User } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Get the current user from the session token.
 * @param request The request object
 * @param reply The reply object
 */
export async function listMeHandler(request: FastifyRequest, reply: FastifyReply<User>) {
	//

	//
	// Retrieve roles and permissions for the user
	// and merge them into the user data.

	userData.permissions = await authProvider.getPermissionsFromUserId(request.me._id);

	//
	// Add seen_last_at for this user asynchronously

	await goDb.core.users.updateOne(
		{ _id: request.me._id },
		{ seen_last_at: Dates.now('utc').unix_milliseconds },
	);

	//
	// Send the user data back in the response.

	return sendSuccessApiResponse(reply, userData);
}
