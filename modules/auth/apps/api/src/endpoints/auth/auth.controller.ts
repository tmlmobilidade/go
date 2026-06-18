/* * */

import { HTTP_STATUS, HttpException, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { sendResetPasswordEmail } from '@tmlmobilidade/emails';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { AUTH_SESSION_COOKIE_NAME, authProvider, users, verificationTokens } from '@tmlmobilidade/interfaces';
import { generateRandomToken } from '@tmlmobilidade/strings';
import { type LoginDto, LoginDtoSchema, type Session } from '@tmlmobilidade/types';

/* * */

export class AuthController {
	//

	/**
	 * Change user password
	 */
	static async changePassword(request: FastifyRequest<{ Body: { password_hash: string, token: string } }>, reply: FastifyReply<void>) {
		// Check if the verification token is valid
		const tokenResult = await verificationTokens.findOne({ token: { $eq: request.body.token } });
		// If the token is invalid or expired, throw an error
		if (!tokenResult || tokenResult.expires_at < Dates.now('utc').unix_timestamp) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid or expired token');
		}
		// Update the user's password in the database
		await users.updateById(tokenResult.user_id, { password_hash: request.body.password_hash });
		// Once the token is validated, delete it from the database
		await verificationTokens.deleteOne({ token: { $eq: request.body.token } });
		// Send a success response
		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Authenticate a user from a login request and create a new session.
	 */
	static async login(request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply<Session>) {
		const result = LoginDtoSchema.safeParse(request.body);
		if (!result.success) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, result.error.message);
		}
		let newSession: Session;
		try {
			newSession = await authProvider.login({
				email: result.data.email,
				password: result.data.password,
			});
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw error;
		}
		// Set the session token cookie in the response
		reply.setCookie(AUTH_SESSION_COOKIE_NAME, newSession.token, {
			httpOnly: true,
			maxAge: 30 * 24 * 60 * 60, // 30 days
			path: '/',
			sameSite: 'lax',
			secure: true,
		});
		// Send the session data in the response
		reply.send({ data: newSession, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Logout a user by clearing their session token cookie.
	 */
	static async logout(request: FastifyRequest, reply: FastifyReply<void>) {
		// Extract the session token from the request cookies
		// and call the authProvider to log out the user.
		const sessionToken = request.cookies[AUTH_SESSION_COOKIE_NAME];
		await authProvider.logout(sessionToken);
		// Clear the session token by expiring the cookie
		reply.setCookie(AUTH_SESSION_COOKIE_NAME, '', {
			httpOnly: true,
			maxAge: 0,
			path: '/',
			sameSite: 'lax',
			secure: true,
		});
		// Send a success response
		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Send an email to the user with a password reset link.
	 */
	static async sendPasswordResetEmail(request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply<void>) {
		// Search user by the email provided in the request body
		const foundUser = await users.findByEmail(request.body.email);
		if (!foundUser) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, `User not found with email ${request.body.email}`);
		}
		// Generate a random token for password reset
		const randomToken = generateRandomToken();
		// Create a verification token entry in the database
		// with an expiration time of 1 hour
		await verificationTokens.insertOne({
			expires_at: Dates.now('utc').plus({ hours: 1 }).unix_timestamp,
			token: randomToken,
			user_id: foundUser._id,
		});
		// Send the password reset email to the user
		await sendResetPasswordEmail({
			data: {
				firstName: foundUser.first_name,
				resetPasswordUrl: `${PAGE_ROUTES.auth.CHANGE_PASSWORD_LIST}?token=${randomToken}&email=${encodeURIComponent(foundUser.email)}`,
			},
			to: request.body.email,
		});
		// Send a success response
		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
}
