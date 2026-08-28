/* * */

import { HTTP_STATUS, HttpException, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { sendResetPasswordEmail } from '@tmlmobilidade/go-providers-emails';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { generateRandomToken } from '@tmlmobilidade/strings';

/**
 * Send an email to the user with a password reset link.
 */
export async function sendPasswordResetEmailHandler(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply<void>) {
	// Search user by the email provided in the request body
	const foundUser = await goDb.core.users.findOne({ email: { $eq: request.body.email } });
	if (!foundUser) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, `User not found with email ${request.body.email}`);
	}
	// Generate a random token for password reset
	const randomToken = generateRandomToken();
	// Create a verification token entry in the database
	// with an expiration time of 1 hour
	await goDb.core.verificationTokens.insertOne({
		expires_at: Dates.now('utc').plus({ hours: 1 }).unix_timestamp,
		token: randomToken,
		user_id: foundUser._id,
	});
	// Send the password reset email to the user
	await sendResetPasswordEmail({
		data: {
			firstName: foundUser.first_name,
			resetPasswordUrl: `${PAGE_ROUTES.core.CHANGE_PASSWORD_LIST}?token=${randomToken}&email=${encodeURIComponent(foundUser.email)}`,
		},
		to: request.body.email,
	});
	// Send a success response
	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
