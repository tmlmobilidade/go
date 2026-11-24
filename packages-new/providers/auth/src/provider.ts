/* * */

import { getOrganizationFromSessionToken } from './methods/get-organization-from-session-token.js';
import { getPermissionsFromSessionToken } from './methods/get-permissions-from-session-token.js';
import { getPermissionsFromUserId } from './methods/get-permissions-from-user-id.js';
import { getUserFromSessionToken } from './methods/get-user-from-session-token.js';

/**
 * The auth provider is used as the single point of entry
 * for the authentication and authorization system of the platform.
 * It provides methods to get the user data, organization data, and permissions data
 * from the database based on the session token.
 */
export const authProvider = {
	getOrganizationFromSessionToken,
	getPermissionsFromSessionToken,
	getPermissionsFromUserId,
	getUserFromSessionToken,
};
