/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { authProvider, users, verificationTokens } from '@tmlmobilidade/interfaces';
import { getAppConfig, HttpStatus } from '@tmlmobilidade/lib';
import { createEmail, LoginDto, LoginDtoSchema, Session } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

const COOKIE_NAME = 'session_token';

/* * */

export class AuthController {
	/**
	 * Get Permissions - Get the permissions of the current user
	 */
	async getPermissions(request: FastifyRequest, reply: FastifyReply) {
		const session_token = request.cookies[COOKIE_NAME];

		const { action, resource } = request.query as {
			action: string
			resource: string
		};

		if (!resource || !action) {
			return reply
				.status(HttpStatus.BAD_REQUEST)
				.send('Resource and action are required');
		}

		const permissions = await authProvider.getPermission(
			session_token,
			resource,
			action,
		);
		return reply.status(HttpStatus.OK).send(permissions);
	}

	/**
	 * Login - Login a user and set a cookie with the session token
	 */
	async login(request: FastifyRequest, reply: FastifyReply) {
		const body = request.body as LoginDto;

		const result = LoginDtoSchema.safeParse(body);

		if (!result.success) {
			return reply
				.status(HttpStatus.BAD_REQUEST)
				.send(result.error.message);
		}

		const session: Session = await authProvider.login({
			email: createEmail(result.data.email),
			password: result.data.password,
		});

		reply.setCookie(COOKIE_NAME, session.token, {
			domain:
				process.env.NODE_ENV === 'development'
					? 'localhost'
					: getAppConfig('auth', 'cookie_domain'),
			httpOnly: true,
			maxAge:
				parseInt(process.env.COOKIE_MAX_AGE_DAYS ?? '30')
				* 24
				* 60
				* 60, // 30 days
			path: '/',
			sameSite: 'none',
			secure: true,
		});

		return reply.status(HttpStatus.OK).send(session);
	}

	/**
	 * Logout - Remove the session token cookie
	 */
	async logout(request: FastifyRequest, reply: FastifyReply) {
		const session_token = request.cookies[COOKIE_NAME];

		await authProvider.logout(session_token);

		reply.clearCookie(COOKIE_NAME);
		return reply.status(HttpStatus.OK).send();
	}

	/**
	 * Verify - Verify a user's email
	 */
	async verify(request: FastifyRequest, reply: FastifyReply) {
		// Get the token from the request body
		const { password_hash, token } = request.body as { password_hash: string, token: string };

		// Verify the token
		const token_result = await verificationTokens.findOne({ token });

		if (!token_result || token_result.expires_at < Dates.now('utc').unix_timestamp) {
			return reply.status(HttpStatus.BAD_REQUEST).send({ message: 'Invalid or expired token' });
		}

		// Update the user's password
		await users.updateOne({ _id: token_result.user_id }, { password_hash });

		// Delete the token
		await verificationTokens.deleteOne({ token });

		// Return the user
		return reply.status(HttpStatus.OK).send({ message: 'Password updated successfully' });
	}
}
