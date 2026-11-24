/* * */

import { FastifyReply, type FastifyRequest } from '@/types.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { AUTH_SESSION_COOKIE_NAME, type Organization, type SimplifiedUser, SimplifiedUserSchema } from '@tmlmobilidade/go-types-core';
import { type ActionsOf, type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { sendErrorApiResponse } from './response/send-error-response.js';

/* * */

interface AuthorizationPermissionCheck<S extends Permission['scope'] = Permission['scope']> {
	actions: ActionsOf<S>[]
	requireAll?: boolean
	scope: S
}

/* * */

declare module 'fastify' {
	export interface FastifyRequest {
		me: SimplifiedUser
		organization: Organization
		permissions: Permission[]
	}
}

function isPermissionCheckAllowed(permissionEntries: Permission[], check: AuthorizationPermissionCheck) {
	const permissionChecks = check.actions.map(action => PermissionCatalog.hasPermission(permissionEntries, check.scope, action));

	return check.requireAll
		? permissionChecks.every(Boolean)
		: permissionChecks.some(Boolean);
}

/**
 * Creates an authorization middleware that validates user authentication and permissions.
 * @param scope The permission scope to check (optional).
 * @param action The permission action(s) to check (optional).
 * @param requireAll Whether all actions must be true or at least one must be true.
 * @returns Fastify middleware function.
 */
export function authorizationMiddleware(checks: AuthorizationPermissionCheck[]): (request: FastifyRequest, reply: FastifyReply<string>) => Promise<void>;
export function authorizationMiddleware<S extends Permission['scope']>(scope?: S, actions?: ActionsOf<S>[], requireAll?: boolean): (request: FastifyRequest, reply: FastifyReply<string>) => Promise<void>;
export function authorizationMiddleware<S extends Permission['scope']>(scopeOrChecks?: AuthorizationPermissionCheck[] | S, actions: ActionsOf<S>[] = [], requireAll = false) {
	return async (request: FastifyRequest, reply: FastifyReply<string>): Promise<void> => {
		//

		//
		// Extract the session token from request cookies

		const sessionToken = request.cookies.session_token;

		if (!sessionToken) {
			return reply
				.status(HTTP_STATUS.UNAUTHORIZED)
				.setCookie(AUTH_SESSION_COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax', secure: true })
				.send({ data: null, error: 'Session token is missing', statusCode: HTTP_STATUS.UNAUTHORIZED });
		}

		//
		// Get the user data from the database and simplify it
		// to the minimum information needed for the platform.
		// Add it to the request object.

		try {
			const foundUser = await authProvider.getUserFromSessionToken(sessionToken);
			if (!foundUser) throw new Error('Authorization Middleware Error: User not found');
			request.me = SimplifiedUserSchema.parse(foundUser);
		} catch (error) {
			// Log the error
			Logger.error({ error, message: error.message || 'Authorization Middleware Error: Could not load user data' });
			// Invalidate the session token requiring the user to login again.
			reply.setCookie(AUTH_SESSION_COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax', secure: true });
			// Send the error response
			return sendErrorApiResponse(reply, {
				error: error.message || 'Authorization Middleware Error: Could not load user data',
				status_code: '500',
			});
		}

		//
		// Get the permissions data from the database.
		// Add it to the request object.

		try {
			const permissionsData = await authProvider.getPermissionsFromSessionToken(sessionToken);
			if (!permissionsData) throw new Error('Authorization Middleware Error: Permissions not found');
			request.permissions = permissionsData;
		} catch (error) {
			// Log the error
			Logger.error({ error, message: error.message || 'Authorization Middleware Error: Could not load permissions data' });
			// Invalidate the session token requiring the user to login again.
			reply.setCookie(AUTH_SESSION_COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax', secure: true });
			// Send the error response
			return sendErrorApiResponse(reply, {
				error: error.message || 'Authorization Middleware Error: Could not load permissions data',
				status_code: '500',
			});
		}

		//
		// Get the organization data from the database.
		// Add it to the request object.

		try {
			const organizationData = await authProvider.getOrganizationFromSessionToken(sessionToken);
			if (!organizationData) throw new Error('Authorization Middleware Error: Organization not found');
			request.organization = organizationData;
		} catch (error) {
			// Log the error
			Logger.error({ error, message: error.message || 'Authorization Middleware Error: Could not load organization data' });
			// Invalidate the session token requiring the user to login again.
			reply.setCookie(AUTH_SESSION_COOKIE_NAME, '', { httpOnly: true, maxAge: 0, path: '/', sameSite: 'lax', secure: true });
			// Send the error response
			return sendErrorApiResponse(reply, {
				error: error.message || 'Authorization Middleware Error: Could not load organization data',
				status_code: '500',
			});
		}

		//
		// Evaluate the retrieved permissions,
		// if scope and actions are provided.

		if (Array.isArray(scopeOrChecks)) {
			const isAllowed = scopeOrChecks.some(check => isPermissionCheckAllowed(request.permissions, check));
			if (!isAllowed) throw new HttpException(HTTP_STATUS.FORBIDDEN, `Insufficient permissions | User: ${request.me._id}`);
			return;
		}

		if (!scopeOrChecks) return;

		const permissionChecks = actions.map(action => PermissionCatalog.hasPermission(request.permissions, scopeOrChecks, action));

		const isAllowed = requireAll
			? permissionChecks.every(Boolean) // all must be true
			: permissionChecks.some(Boolean); // at least one must be true

		if (!isAllowed) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, `Insufficient permissions | User: ${request.me._id} | Scope: "${scopeOrChecks}" | Actions: [${actions.join(',')}]`);
		}

		//
	};
}
