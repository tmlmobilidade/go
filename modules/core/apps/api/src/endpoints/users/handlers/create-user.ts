/* * */

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { sendWelcomeEmail } from '@tmlmobilidade/go-providers-emails';
import { type CreateUserDto, type User } from '@tmlmobilidade/go-types-core';

/**
 * Create a new user in the database.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function createUserHandler(request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply<User>) {
	//

	//
	// Register the new user using the auth provider

	const verificationToken = await authProvider.register({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	if (!verificationToken) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to register user',
			status_code: '500',
		});
	}

	//
	// Send a welcome email to the user with the verification token

	await sendWelcomeEmail({
		data: {
			firstName: request.body.first_name,
			resetPasswordUrl: `${PAGE_ROUTES.core.CHANGE_PASSWORD_LIST}?token=${verificationToken}&email=${encodeURIComponent(request.body.email)}`,
		},
		to: request.body.email,
	});

	//
	// Fetch the newly created user to ensure it was created successfully
	// and send a response back to the client

	const newUser = await goDb.core.users.findOne({ email: request.body.email });

	if (!newUser) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to create user',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, newUser);
}
