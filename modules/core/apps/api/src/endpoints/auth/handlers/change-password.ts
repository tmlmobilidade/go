/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AuthChangePasswordRequest, AuthChangePasswordRequestSchema, PasswordRequirementsSchema } from '@tmlmobilidade/go-core-pckg-types';
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

	//
	// Validate the password requirements

	const passwordValidationResult = PasswordRequirementsSchema.safeParse(request.body.password);

	if (!passwordValidationResult.success) {
		sendErrorApiResponse(reply, {
			error: passwordValidationResult.error.message,
			status_code: '400',
		});
	}

	//
	// Check if the verification token is valid

	const foundVerificationToken = await goDb.core.verificationTokens.findOne({
		expires_at: { $gt: Dates.now('utc').unix_milliseconds },
		token: { $eq: request.body.token },
	});

	if (!foundVerificationToken) {
		return sendErrorApiResponse(reply, {
			error: 'Invalid or expired token',
			status_code: '400',
		});
	}

	//
	// Update the user's password in the database

	const hashedPassword = await bcrypt.hash(request.body.password, 12);

	await goDb.core.users.updateOne(
		{ _id: { $eq: foundVerificationToken.user_id } },
		{ password_hash: hashedPassword },
	);

	//
	// Once the token is validated, delete it from the database

	await goDb.core.verificationTokens.deleteOne({ token: { $eq: request.body.token } });

	//
	// Send a success response

	return sendSuccessApiResponse(reply, undefined);
}
