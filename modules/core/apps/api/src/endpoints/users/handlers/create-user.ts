/* * */

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type UsersCreateItemRequest, UsersCreateItemRequestSchema, type UsersCreateItemResponse } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { hashAuthToken } from '@tmlmobilidade/go-providers-auth';
import { sendWelcomeEmail } from '@tmlmobilidade/go-providers-emails';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { generateRandomToken } from '@tmlmobilidade/strings';

/**
 * Create a new user in the database.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function createUserHandler(request: FastifyRequest<{ Body: UsersCreateItemRequest }>, reply: FastifyReply<UsersCreateItemResponse>) {
	//

	//
	// Validate the request body

	const validatedRequest = UsersCreateItemRequestSchema.safeParse(request.body);

	if (!validatedRequest.success) {
		Logger.error({ message: validatedRequest.error.message });
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
		dismissed_banners: [],
		email_verified: null,
		is_locked: false,
		password_hash: null,
		permissions: [],
		phone: null,
		preferences: null,
		seen_changelogs: [],
		seen_last_at: null,
		session_ids: [],
		updated_by: request.me._id,
		verification_token_ids: [],
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

	return sendSuccessApiResponse(reply, {
		user_id: newUserData._id,
	});
}
