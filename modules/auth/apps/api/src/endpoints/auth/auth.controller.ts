/* * */

import { HttpException, HttpStatus, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { sendResetPasswordEmail } from '@tmlmobilidade/emails';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { authProvider, users, verificationTokens } from '@tmlmobilidade/interfaces';
import { generateRandomToken } from '@tmlmobilidade/strings';
import { type LoginDto, LoginDtoSchema, type Permission, type Session } from '@tmlmobilidade/types';

/* * */

const COOKIE_NAME = 'session_token';

/* * */

export class AuthController {
	/**
	 *  Change password on database and delete token
	 */
	async changePassword(request: FastifyRequest, reply: FastifyReply<void>) {
		const { password_hash, token } = request.body as { password_hash: string, token: string };

		const tokenResult = await verificationTokens.findOne({ token: { $eq: token } });

		if (!tokenResult || tokenResult.expires_at < Dates.now('utc').unix_timestamp) {
			throw new HttpException(HttpStatus.BAD_REQUEST, 'Invalid or expired token');
		};

		await users.updateById(tokenResult.user_id, { password_hash: password_hash });

		reply.send({
			data: undefined,
			error: null,
			statusCode: HttpStatus.OK,
		}).status(HttpStatus.OK);
	}

	/**
	 * Get Permissions - Get the permissions of the current user
	 */
	async getPermissions(request: FastifyRequest, reply: FastifyReply<Permission<unknown>[]>) {
		const session_token = request.cookies[COOKIE_NAME];
		const permissions = await authProvider.getPermissions({ sessionToken: session_token });
		return reply.send({ data: permissions, error: null, statusCode: HttpStatus.OK }).status(HttpStatus.OK);
	}

	/**
	 * Login - Login a user and set a cookie with the session token
	 */
	async login(request: FastifyRequest, reply: FastifyReply<Session>) {
		const body = request.body as LoginDto;

		const result = LoginDtoSchema.safeParse(body);

		if (!result.success) {
			throw new HttpException(HttpStatus.BAD_REQUEST, result.error.message);
		}

		const session: Session = await authProvider.login({
			email: result.data.email,
			password: result.data.password,
		});

		reply.setCookie(COOKIE_NAME, session.token, {
			httpOnly: true,
			maxAge: 30 * 24 * 60 * 60, // 30 days
			path: '/',
			sameSite: 'lax',
			secure: true,
		});

		return reply
			.send({
				data: session,
				error: null,
				statusCode: HttpStatus.OK,
			})
			.status(HttpStatus.OK);
	}

	/**
	 * Logout - Remove the session token cookie
	 */
	async logout(request: FastifyRequest, reply: FastifyReply<void>) {
		//

		//
		// Extract the session token from the request cookies
		// and call the authProvider to log out

		const session_token = request.cookies[COOKIE_NAME];
		await authProvider.logout(session_token);

		//
		// Clear the session token cookie by setting
		// the maxAge to 0 and sending it back in the response

		return reply
			.setCookie(COOKIE_NAME, '', {
				httpOnly: true,
				maxAge: 0,
				path: '/',
				sameSite: 'lax',
				secure: true,
			})
			.send({
				data: undefined,
				error: null,
				statusCode: HttpStatus.OK,
			});
	}

	/**
	 * Go check email is valid for send link to reset password
	 */
	async sendEmailWithResetPasswordURL(request: FastifyRequest, reply: FastifyReply<void>) {
		//

		const { email } = request.body as { email: string };

		// Search user by Email
		const foundUser = await users.findByEmail(email);
		if (!foundUser) throw new HttpException(HttpStatus.NOT_FOUND, `User not found with email ${email}`);

		const token = generateRandomToken();

		// Save token in DB
		await verificationTokens.insertOne({
			expires_at: Dates.now('utc').plus({ hours: 1 }).unix_timestamp,
			token: token,
			user_id: foundUser._id,
		});

		await sendResetPasswordEmail({
			props: {
				first_name: foundUser.first_name,
				password_reset_link: `${PAGE_ROUTES.auth.RESET_PASSWORD_LIST}?token=${token}`,
			},
			to: email,
		});

		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Verify - Verify a user's email
	 */
	async verify(request: FastifyRequest, reply: FastifyReply<void>) {
		// Get the token from the request body
		const { password_hash, token } = request.body as { password_hash: string, token: string };

		// Verify the token
		const tokenResult = await verificationTokens.findOne({ token });

		if (!tokenResult || tokenResult.expires_at < Dates.now('utc').unix_timestamp) {
			throw new HttpException(HttpStatus.BAD_REQUEST, 'Invalid or expired token');
		}

		// Update the user's password
		await users.updateOne({ _id: tokenResult.user_id }, { password_hash });

		// Delete the token
		await verificationTokens.deleteOne({ token });

		// Return the user
		return reply.status(HttpStatus.OK).send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}
}
