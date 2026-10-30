/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AuthChangePasswordRequest, AuthChangePasswordRequestSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import bcrypt from 'bcryptjs';

/**
 * Change user password
 */
export async function changePasswordHandler(request: FastifyRequest<{ Body: AuthChangePasswordRequest }>, reply: FastifyReply<void>) {
	//

	//
	// Verify if the request body is valid

	const validatedRequest = AuthChangePasswordRequestSchema.safeParse(request.body);

	if (!validatedRequest.success) {
		sendErrorApiResponse(reply, {
			error: validatedRequest.error.message,
			status_code: '400',
		});
	}

	const { password, token } = request.body ?? {};

	const isValidPassword = typeof password === 'string' && password.length >= 15 && Buffer.byteLength(password, 'utf8') <= 72;
	const commonPasswords = ['123456789012345', 'passwordpassword', 'qwertyuiopasdfgh'];
	const isCommonPassword = typeof password === 'string' && commonPasswords.includes(password.toLowerCase());
	if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) || !isValidPassword || isCommonPassword) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid token or password requirements not met');
	}
	// Check if the verification token is valid
	const tokenResult = await goDb.core.verificationTokens.findOne({ token: { $eq: request.body.token } });
	// If the token is invalid or expired, throw an error
	if (!tokenResult || tokenResult.expires_at < Dates.now('utc').unix_milliseconds) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid or expired token');
	}
	// Update the user's password in the database
	await goDb.core.users.updateById(tokenResult.user_id, { password_hash: await bcrypt.hash(password, 12) });
	// Once the token is validated, delete it from the database
	await goDb.core.verificationTokens.deleteOne({ token: { $eq: request.body.token } });
	// Send a success response
	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
