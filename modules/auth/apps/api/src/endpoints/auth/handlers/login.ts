/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { AUTH_SESSION_COOKIE_NAME, authProvider } from '@tmlmobilidade/go-providers-auth';
import { type LoginDto, LoginDtoSchema, type Session } from '@tmlmobilidade/go-types-core';
/**
 * Authenticate a user from a login request and create a new session.
 */
export async function loginHandler(request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply<Session>) {
	//

	//
	// Validate the request body

	const validationResult = LoginDtoSchema.safeParse(request.body);

	if (!validationResult.success) {
		return sendErrorApiResponse(reply, {
			error: validationResult.error.message,
			status_code: '400',
		});
	}

	//
	// Try to login the user

	const newSession = await authProvider.login({
		email: validationResult.data.email,
		password: validationResult.data.password,
	});

	//
	// Set the session token cookie in the response

	reply.setCookie(AUTH_SESSION_COOKIE_NAME, newSession.token, {
		httpOnly: true,
		maxAge: 30 * 24 * 60 * 60, // 30 days
		path: '/',
		sameSite: 'lax',
		secure: true,
	});

	//
	// Send the session data in the response

	return sendSuccessApiResponse(reply, newSession);
}
