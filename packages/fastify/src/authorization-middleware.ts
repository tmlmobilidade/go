/* * */

import { FastifyReply, type FastifyRequest } from '@/fastify-service.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { AUTH_SESSION_COOKIE_NAME, authProvider } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type ActionsOf, type Organization, type Permission, PermissionCatalog, type User } from '@tmlmobilidade/types';

/* * */

declare module 'fastify' {
	export interface FastifyRequest {
		me: User
		organization: Organization
		permissions: Permission[]
	}
}

/**
 * Creates an authorization middleware that validates user authentication and permissions.
 * @param scope The permission scope to check (optional).
 * @param action The permission action(s) to check (optional).
 * @param requireAll Whether all actions must be true or at least one must be true.
 * @returns Fastify middleware function.
 */
export function authorizationMiddleware<S extends Permission['scope']>(scope?: S, actions?: ActionsOf<S>[], requireAll = false) {
	return async (request: FastifyRequest, reply: FastifyReply<string>): Promise<void> => {
		//

		//
		// Extract the session token from request cookies

		const sessionToken = request.cookies.session_token;

		if (!sessionToken) {
			return reply
				.setCookie(AUTH_SESSION_COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax', secure: true })
				.send({ data: null, error: 'Session token is missing', statusCode: HTTP_STATUS.UNAUTHORIZED });
		}

		//
		// Get user and permissions from cache or auth provider.
		// Cache is per session token, and valid for 5 minutes.
		// This reduces the number of calls to the auth provider.

		try {
			const userData = await authProvider.getUserFromSessionToken(sessionToken);
			const permissionsData = await authProvider.getPermissionsFromSessionToken(sessionToken);
			const organizationData = await authProvider.getOrganizationFromSessionToken(sessionToken);

			if (!userData || !permissionsData || !organizationData) {
				return reply
					.setCookie(AUTH_SESSION_COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax', secure: true })
					.send({ data: null, error: 'User, Permissions or Organization not found', statusCode: HTTP_STATUS.UNAUTHORIZED });
			}

			request.me = userData;
			request.permissions = permissionsData;
			request.organization = organizationData;
		} catch (error) {
			console.error('Authorization Middleware Error:', error);
			return reply
				.setCookie(AUTH_SESSION_COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax', secure: true })
				.send({ data: null, error: 'Authorization Middleware Error', statusCode: HTTP_STATUS.UNAUTHORIZED });
		}

		//
		// Evaluate the retrieved permissions,
		// if scope and actions are provided.

		if (!scope) return;

		const permissionChecks = actions.map(action => PermissionCatalog.hasPermission(request.permissions, scope, action));

		const isAllowed = requireAll
			? permissionChecks.every(Boolean) // all must be true
			: permissionChecks.some(Boolean); // at least one must be true

		if (!isAllowed) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, `Insufficient permissions | User: ${request.me._id} | Scope: "${scope}" | Actions: [${actions.join(',')}]`);
			Logger.issue('error', error, {
				action: 'authorizationMiddleware',
				feature: 'authorization',
				request,
			});
			throw error;
		}

		//
	};
}
