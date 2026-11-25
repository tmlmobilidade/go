/* * */

import { type Permission } from '@tmlmobilidade/go-types-permissions';

import { getPermissionsFromUserId } from './get-permissions-from-user-id.js';
import { getUserFromSessionToken } from './get-user-from-session-token.js';

/**
 * Get permissions for a user based on their session token.
 * @param sessionToken The session token.
 * @returns The permissions that the user has.
 */
export async function getPermissionsFromSessionToken(sessionToken: string): Promise<Permission[]> {
	//

	//
	// Get the user data from the database

	const userData = await getUserFromSessionToken(sessionToken);

	if (!userData) return [];

	//
	// Get the permissions from the user

	return getPermissionsFromUserId(userData._id);
}
