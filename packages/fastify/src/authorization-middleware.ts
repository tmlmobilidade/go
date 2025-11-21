/* * */

import { type FastifyRequest } from '@/fastify-service.js';
import { API_ROUTES, HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type Permission, PermissionCatalog, type User } from '@tmlmobilidade/types';
import { Cache, fetchData } from '@tmlmobilidade/utils';

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
 * Fetches user data from the authentication API.
 * @param sessionToken The session token for authentication.
 * @returns A promise that resolves to the user data.
 */
async function fetchUserData(sessionToken: string): Promise<User> {
	// Fetch user data from the authentication API
	const userResponse = await fetchData<User>(API_ROUTES.auth.USERS_ME, 'GET', undefined, { Cookie: `session_token=${sessionToken}` });
	// Handle errors if response is not OK
	if (userResponse.statusCode !== HttpStatus.OK) throw new HttpException(userResponse.statusCode, userResponse.error ?? 'Failed to fetch user data');
	// Ensure user data is present
	if (!userResponse.data) throw new HttpException(HttpStatus.UNAUTHORIZED, 'User not found');
	// Return the fetched user data
	return userResponse.data;
}

/**
 * Fetches user permissions from the authentication API.
 * @param sessionToken The session token for authentication.
 * @returns A promise that resolves to an array of user permissions.
 */
async function fetchUserPermissions(sessionToken: string): Promise<Permission[]> {
	// Fetch user permissions from the authentication API
	const permissionsResponse = await fetchData<Permission[]>(API_ROUTES.auth.AUTH_PERMISSIONS, 'GET', undefined, { Cookie: `session_token=${sessionToken}` });
	// Handle errors if response is not OK
	if (permissionsResponse.statusCode !== HttpStatus.OK) throw new HttpException(permissionsResponse.statusCode, permissionsResponse.error ?? 'Failed to fetch permissions');
	// Ensure permissions data is present
	if (!permissionsResponse.data) throw new HttpException(HttpStatus.UNAUTHORIZED, 'Permissions not found');
	// Return the fetched permissions data
	return permissionsResponse.data;
}

/**
 * Creates an authorization middleware that validates user authentication and permissions.
 * @param scope The permission scope to check (optional).
 * @param action The permission action(s) to check (optional).
 * @param requireAll Whether all actions must be true or at least one must be true.
 * @returns Fastify middleware function.
 */
export function authorizationMiddleware(scope?: string, actions?: string[], requireAll = false) {
	return async (request: FastifyRequest): Promise<void> => {
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
			request.me = await fetchUserData(sessionToken);
			request.permissions = await fetchUserPermissions(sessionToken);
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
	};
}
