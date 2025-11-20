/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { authProvider } from '@tmlmobilidade/interfaces';
import { type Permission, PermissionCatalog, type User } from '@tmlmobilidade/types';
import { Cache } from '@tmlmobilidade/utils';

/* * */

declare module 'fastify' {
	export interface FastifyRequest {
		me: User
		permissions: Permission[]
	}
}

/* * */

const REQUEST_CACHE = new Cache<string, { permissions: Permission[], user: User }>(5 * 60_000); // 5 minutes TTL

/**
 * Creates an authorization middleware that validates user authentication and permissions.
 * @param scope The permission scope to check (optional).
 * @param action The permission action(s) to check (optional).
 * @param requireAll Whether all actions must be true or at least one must be true.
 * @returns Fastify middleware function.
 */
export function authorizationMiddleware(scope?: string, actions?: string[], requireAll = false) {
	return async (request: FastifyRequest, reply: FastifyReply<unknown>): Promise<void> => {
		try {
			//

			//
			// Extract the session token from request cookies

			const sessionToken = request.cookies.session_token;
			if (!sessionToken) throw new HttpException(HttpStatus.UNAUTHORIZED, 'Invalid authorization token');

			//
			// Get user and permissions from cache or auth provider.
			// Cache is per session token, and valid for 5 minutes.
			// This reduces the number of calls to the auth provider.

			const cachedRequest = REQUEST_CACHE.get(sessionToken);

			if (cachedRequest) {
				request.me = cachedRequest.user;
				request.permissions = cachedRequest.permissions;
			}
			else {
				request.me = await authProvider.getUser(sessionToken);
				request.permissions = await authProvider.getPermissions({ sessionToken });
				REQUEST_CACHE.set(sessionToken, { permissions: request.permissions, user: request.me });
			}

			//
			// Evaluate the retrieved permissions,
			// if scope and actions are provided.

			if (!scope) return;

			const permissionChecks = actions.map(action => PermissionCatalog.hasPermission(request.permissions, scope, action));

			const isAllowed = requireAll
				? permissionChecks.every(Boolean) // all must be true
				: permissionChecks.some(Boolean); // at least one must be true

			if (!isAllowed) throw new HttpException(HttpStatus.FORBIDDEN, `Insufficient permissions | User: ${request.me._id} | Scope: "${scope}" | Actions: [${actions.join(',')}]`);

			//
		}
		catch (error) {
			// On unauthorized error, clear the session cookie
			if (error instanceof HttpException && error.statusCode === HttpStatus.UNAUTHORIZED) {
				reply.clearCookie('session_token');
			}
			// Otherwise, rethrow the error
			throw error;
		}
	};
}
