/* * */

import { type Permission } from '../permissions.js';

/**
 * Check if a list of permission entries has the requested scope/action pair.
 * @param userPermissions The list of permission entries to check against.
 * @param requiredPermission The required permission to check.
 * @returns True if the permission is found, false otherwise.
 */
export function hasPermission(userPermissions: Permission[], requiredPermission: Omit<Permission, 'resources'>): boolean {
	//

	//
	// Return false if no permissions

	if (!userPermissions) return false;

	//
	// Find the permission with the given action and scope

	const foundPermission = userPermissions.find(p => p.action === requiredPermission.action && p.scope === requiredPermission.scope);

	if (!foundPermission) return false;

	return true;
}
