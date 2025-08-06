/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { authProvider } from '@tmlmobilidade/interfaces';
import { getAppConfig, HttpException, HttpStatus } from '@tmlmobilidade/lib';
import { type Permission } from '@tmlmobilidade/types';

/* * */

declare module 'fastify' {
	export interface FastifyRequest {
		permissions: Permission<unknown>[]
	}
}

/* * */

export default function authorizationMiddleware(scope?: string, action?: string) {
	return async (request: FastifyRequest, reply: FastifyReply<void>): Promise<void> => {
		const token = request.cookies.session_token;

		if (!token) {
			throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid authorization token');
		}

		// If no scope or action is provided, only check if the user is authenticated
		if (!scope && !action) {
			return;
		}

		try {
			const permissions = await authProvider.getPermissions(token);
			request.permissions = permissions;
		}
		catch (error) {
			if (error instanceof HttpException && error.statusCode === HttpStatus.UNAUTHORIZED) {
				reply.clearCookie('session_token', {
					domain: getAppConfig('auth', 'cookie_domain'),
					httpOnly: true,
					maxAge: 0,
					path: '/',
					sameSite: 'none',
					secure: true,
				});
			}

			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send({
					message: error.message || 'An unexpected error occurred',
				});
		}
	};
}
