/* * */

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { sendWelcomeEmail } from '@tmlmobilidade/go-providers-emails';
import { type CreateUserDto, CreateUserSchema, type User } from '@tmlmobilidade/go-types-core';

/**
 * Registers a new User and sends the welcome email.
 * @param request The request object
 * @param reply The reply object
 */
export async function createUserHandler(request: FastifyRequest<{ Body: CreateUserDto }>, reply: FastifyReply<User>) {
	//

	//
	// Validate the request body

	const validatedUser = CreateUserSchema.safeParse({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	if (!validatedUser.success) {
		return sendErrorApiResponse(reply, {
			error: validatedUser.error.message,
			status_code: '400',
		});
	}

	//
	// Register the new user using the auth provider

	const verificationToken = await authProvider.register(validatedUser.data);

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
			firstName: validatedUser.data.first_name,
			resetPasswordUrl: `${PAGE_ROUTES.core.CHANGE_PASSWORD_LIST}?token=${verificationToken}&email=${encodeURIComponent(validatedUser.data.email)}`,
		},
		to: validatedUser.data.email,
	});

	//
	// Fetch the newly created user to ensure it was created successfully

	const newUser = await goDb.core.users.findOne({ email: validatedUser.data.email });

	if (!newUser) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to create user',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, newUser);
}
