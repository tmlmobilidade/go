/* * */

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { sendResetPasswordEmail } from '@tmlmobilidade/go-providers-emails';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { generateRandomToken } from '@tmlmobilidade/strings';

/**
 * Sends an email to the user with a password reset link.
 * @param request The request object
 * @param reply The reply object
 */
export async function sendPasswordResetEmailHandler(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply<void>) {
	//

	//
	// Search the user by the email provided in the request body

	const foundUser = await goDb.core.users.findOne({ email: { $eq: request.body.email } });

	if (!foundUser) {
		return sendErrorApiResponse(reply, {
			error: `User not found with email ${request.body.email}`,
			status_code: '404',
		});
	}

	//
	// Create a verification token entry in the database
	// with an expiration time of 1 hour

	const randomToken = generateRandomToken();

	await goDb.core.verificationTokens.insertOne({
		expires_at: Dates.now('utc').plus({ hours: 1 }).unix_milliseconds,
		token: randomToken,
		user_id: foundUser._id,
	});

	//
	// Send the password reset email to the user

	await sendResetPasswordEmail({
		data: {
			firstName: foundUser.first_name,
			resetPasswordUrl: `${PAGE_ROUTES.core.CHANGE_PASSWORD_LIST}?token=${randomToken}&email=${encodeURIComponent(foundUser.email)}`,
		},
		to: request.body.email,
	});

	return sendSuccessApiResponse(reply, undefined);
}
