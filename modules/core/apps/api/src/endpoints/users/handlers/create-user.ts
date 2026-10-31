/* * */

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { hashAuthToken } from '@tmlmobilidade/go-providers-auth';
import { sendWelcomeEmail } from '@tmlmobilidade/go-providers-emails';
import { type CreateUserDto, CreateUserSchema } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { generateRandomToken } from '@tmlmobilidade/strings';

/**
 * Create a new user in the database.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function createUserHandler(request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply<void>) {
	//

	//
	// Validate the request body

	const validatedRequest = CreateUserSchema.safeParse(request.body);

	if (!validatedRequest.success) {
		return sendErrorApiResponse(reply, {
			error: validatedRequest.error.message,
			status_code: '400',
		});
	}

	//
	// Create a new user document

	const newUserData = await goDb.core.users.insertOne({
		...validatedRequest.data,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	//
	// Generate a verification token and send it to the user

	const randomToken = generateRandomToken();

	const newVerificationTokenData = await goDb.core.verificationTokens.insertOne({
		expires_at: Dates.now('utc').plus({ days: 7 }).unix_milliseconds,
		token: hashAuthToken(randomToken),
		user_id: newUserData._id,
	});

	if (!newVerificationTokenData) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to create verification token',
			status_code: '500',
		});
	}

	//
	// Send a welcome email to the user with the verification token

	await sendWelcomeEmail({
		data: {
			firstName: request.body.first_name,
			resetPasswordUrl: `${PAGE_ROUTES.core.CHANGE_PASSWORD_LIST}?token=${randomToken}&email=${encodeURIComponent(request.body.email)}`,
		},
		to: request.body.email,
	});

	return sendSuccessApiResponse(reply, undefined);
}
