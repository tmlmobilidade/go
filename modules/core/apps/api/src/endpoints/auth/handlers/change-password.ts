/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Changes the password of the user that owns the given verification token.
 * @param request The request object
 * @param reply The reply object
 */
export async function changePasswordHandler(request: FastifyRequest<{ Body: { password_hash: string, token: string } }>, reply: FastifyReply<void>) {
	//

	//
	// Check if the verification token is valid and not expired

	const foundToken = await goDb.core.verificationTokens.findOne({ token: { $eq: request.body.token } });

	if (!foundToken || foundToken.expires_at < Dates.now('utc').unix_milliseconds) {
		return sendErrorApiResponse(reply, {
			error: 'Invalid or expired token',
			status_code: '400',
		});
	}

	//
	// Update the user's password in the database

	await goDb.core.users.updateById(foundToken.user_id, { password_hash: request.body.password_hash });

	//
	// Once the token is validated, delete it from the database

	await goDb.core.verificationTokens.deleteOne({ token: { $eq: request.body.token } });

	return sendSuccessApiResponse(reply, undefined);
}
