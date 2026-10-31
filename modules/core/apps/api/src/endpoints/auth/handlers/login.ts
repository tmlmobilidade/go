/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AuthLoginRequest, AuthLoginRequestSchema } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { hashAuthToken } from '@tmlmobilidade/go-providers-auth';
import { AUTH_SESSION_COOKIE_NAME } from '@tmlmobilidade/go-types-core';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { generateRandomToken } from '@tmlmobilidade/strings';
import bcrypt from 'bcryptjs';

/**
 * Authenticate a user from a login request and create a new session.
 */
export async function loginHandler(request: FastifyRequest<{ Body: AuthLoginRequest }>, reply: FastifyReply<void>) {
	//

	//
	// Validate the request body

	const validatedRequest = AuthLoginRequestSchema.safeParse(request.body);

	if (!validatedRequest.success) {
		return sendErrorApiResponse(reply, {
			error: validatedRequest.error.message,
			status_code: '400',
		});
	}

	//
	// Get the user data

	const userData = await goDb.core.users.findOne({ email: { $eq: validatedRequest.data.email } });

	if (!userData) {
		return sendErrorApiResponse(reply, {
			error: 'User not found',
			status_code: '401',
		});
	}

	//
	// Compare the password hash

	const passwordHashMatch = await bcrypt.compare(validatedRequest.data.password, userData.password_hash ?? '');

	if (!passwordHashMatch) {
		return sendErrorApiResponse(reply, {
			error: 'Invalid password',
			status_code: '401',
		});
	}

	//
	// Create the session and set its value in the response cookie

	const sessionDurationInDays = 30; // days

	const randomToken = generateRandomToken();

	await goDb.core.sessions.insertOne({
		// Sessions expire in 30 days
		expires_at: Dates.now('utc').plus({ days: sessionDurationInDays }).unix_milliseconds,
		// Generate a random token
		token: hashAuthToken(randomToken),
		// Set the user ID
		user_id: userData._id,
	});

	reply.setCookie(AUTH_SESSION_COOKIE_NAME, randomToken, {
		httpOnly: true,
		maxAge: sessionDurationInDays * 24 * 60 * 60, // days to seconds
		path: '/',
		sameSite: 'lax',
		secure: true,
	});

	//
	// Send the session data in the response

	return sendSuccessApiResponse(reply, undefined);
}
