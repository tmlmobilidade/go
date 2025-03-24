import { HttpException, HttpStatus } from '@tmlmobilidade/core/lib';
import { authProvider } from '@tmlmobilidade/core/providers';
import { Permission } from '@tmlmobilidade/core/types';
import { FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
	export interface FastifyRequest {
		permissions?: Permission<unknown>
	}
}

export default function authorizationMiddleware(
	scope?: string,
	action?: string,
) {
	return async (
		request: FastifyRequest,
		reply: FastifyReply,
	): Promise<void> => {
		const token = request.cookies.session_token;

		if (!token) {
			throw new HttpException(
				HttpStatus.UNAUTHORIZED,
				'Invalid authorization token',
			);
		}

		// If no scope or action is provided, only check if the user is authenticated
		if (!scope && !action) {
			return;
		}

		try {
			const permissions = await authProvider.getPermission(token, scope, action);
			request.permissions = permissions;
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send({
					message: error.message || 'An unexpected error occurred',
				});
		}
	};
}
