import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors-fastify';
import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { authProvider } from '@tmlmobilidade/interfaces';
import { type Permission, type User } from '@tmlmobilidade/types';
import { Cache, hasPermission } from '@tmlmobilidade/utils';

declare module 'fastify' {
	export interface FastifyRequest {
		me: User
		permissions: Permission<unknown>[]
	}
}

const REQUEST_CACHE = new Cache<string, { permissions: Permission<unknown>[], user: User }>(5 * 60_000); // 5 minutes TTL

/**
 * Creates an authorization middleware that validates user authentication and permissions
 * @param scope - The permission scope to check (optional)
 * @param action - The permission action(s) to check (optional)
 * @param requireAll - Whether all actions must be true or at least one must be true
 * @returns Fastify middleware function
 */
export function authorizationMiddleware<T = unknown>(scope?: string, actions?: string | string[], requireAll = false) {
	return async (request: FastifyRequest, reply: FastifyReply<unknown>): Promise<void> => {
		try {
			const sessionToken = request.cookies.session_token;

			if (!sessionToken) {
				throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid authorization token');
			}

			let user: User;
			let permissions: Permission<T>[];

			const cachedRequest = REQUEST_CACHE.get(sessionToken);
			if (cachedRequest) {
				user = cachedRequest.user;
				permissions = cachedRequest.permissions;
			}
			else {
				user = await authProvider.getUser(sessionToken);
				permissions = await authProvider.getPermissions({ sessionToken });
				REQUEST_CACHE.set(sessionToken, { permissions, user });
			}

			request.me = user;
			request.permissions = permissions;

			//
			// Check Permissions

			if (!scope) return;

			if (Array.isArray(actions)) {
				const results = actions.map(action => hasPermission(request.permissions, scope, action));

				const isAllowed = requireAll
					? results.every(Boolean) // all must be true
					: results.some(Boolean); // at least one must be true

				if (!isAllowed) {
					throw new HttpException(HttpStatus.FORBIDDEN, 'Insufficient permissions');
				}
			}
			else {
				if (!hasPermission(request.permissions, scope, actions as string)) {
					throw new HttpException(HttpStatus.FORBIDDEN, 'Insufficient permissions');
				}
			}
		}
		catch (error) {
			if (error instanceof HttpException && error.statusCode === HttpStatus.UNAUTHORIZED) {
				reply.clearCookie('session_token');
			}

			throw error;
		}
	};
}
