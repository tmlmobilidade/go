/* * */

import { type Role } from '@tmlmobilidade/go-types-core';
import { type Permission } from '@tmlmobilidade/go-types-permissions';

/**
 * Calculate permissions that a user has from their assigned roles
 * @param roleIds Array of role IDs assigned to the user
 * @param roles Array of all available roles with their permissions
 * @returns Array of permissions inherited from roles
 */
export function calculateRolePermissions(roleIds: string[], roles: Role[]): Permission[] {
	//

	if (!roles?.length) return [];

	const rolePermissions = new Map<string, Permission>();

	// Get all roles assigned to the user
	const userRoles = roles?.filter(role => roleIds.includes(role._id));

	// Collect all permissions from user's roles
	userRoles?.forEach((role) => {
		role.permissions.forEach((permission) => {
			// Build a key for the permission
			const key = `${permission.scope}-${permission.action}`;
			// Check if this permission is already in the array (avoid duplicates)
			if (rolePermissions.has(key)) return;
			// Add the permission to the map
			rolePermissions.set(key, permission);
		});
	});
	// Return the permissions as an array
	return Array.from(rolePermissions.values());
}

/**
 * Check if a user has a specific permission from their roles
 * @param scope Permission scope
 * @param action Permission action
 * @param roleIds Array of role IDs assigned to the user
 * @param roles Array of all available roles with their permissions
 * @returns true if user has this permission from roles
 */
export function hasRolePermission(scope: string, action: string, roleIds: string[], roles: Role[]): boolean {
	const rolePermissions = calculateRolePermissions(roleIds, roles);
	return rolePermissions.some(permission => permission.scope === scope && permission.action === action);
}
