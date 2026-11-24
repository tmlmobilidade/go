/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type SimplifiedUser, SimplifiedUserSchema } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Get the current user from the session token.
 * @param request The request object
 * @param reply The reply object
 */
export async function listMeHandler(request: FastifyRequest, reply: FastifyReply<SimplifiedUser>) {
	//

	//
	// Add seen_last_at for this user asynchronously

	await goDb.core.users.updateOne(
		{ _id: request.me._id },
		{ seen_last_at: Dates.now('utc').unix_milliseconds },
	);

	//
	// Strip the user data to the minimum information needed for the platform.

	const simplifiedUserData = SimplifiedUserSchema.parse(request.me);

	//
	// Send the user data back in the response.

	return sendSuccessApiResponse(reply, simplifiedUserData);
}
