/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Change user password
 */
export async function changePasswordHandler(request: FastifyRequest<{ Body: { password_hash: string, token: string } }>, reply: FastifyReply<void>) {
	// Check if the verification token is valid
	const tokenResult = await goDb.core.verificationTokens.findOne({ token: { $eq: request.body.token } });
	// If the token is invalid or expired, throw an error
	if (!tokenResult || tokenResult.expires_at < Dates.now('utc').unix_milliseconds) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid or expired token');
	}
	// Update the user's password in the database
	await goDb.core.users.updateById(tokenResult.user_id, { password_hash: request.body.password_hash });
	// Once the token is validated, delete it from the database
	await goDb.core.verificationTokens.deleteOne({ token: { $eq: request.body.token } });
	// Send a success response
	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
