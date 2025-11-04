import { Permission } from '@tmlmobilidade/types';

/**
 * Calculate permissions that a user has from their assigned roles
 * @param roleIds Array of role IDs assigned to the user
 * @param roles Array of all available roles with their permissions
 * @returns Array of permissions inherited from roles
 */
export function calculateRolePermissions(
	roleIds: string[],
	roles: { _id: string, permissions: Permission<unknown>[] }[],
): Permission<unknown>[] {
	const rolePermissions: Permission<unknown>[] = [];

	// Get all roles assigned to the user
	const userRoles = roles.filter(role => roleIds.includes(role._id));

	// Collect all permissions from user's roles
	userRoles.forEach((role) => {
		role.permissions.forEach((permission) => {
			// Check if this permission is already in the array (avoid duplicates)
			const existingPermission = rolePermissions.find(
				p => p.scope === permission.scope && p.action === permission.action,
			);

			if (!existingPermission) {
				rolePermissions.push(permission);
			}
		});
	});

	return rolePermissions;
}

/**
 * Check if a user has a specific permission from their roles
 * @param scope Permission scope
 * @param action Permission action
 * @param roleIds Array of role IDs assigned to the user
 * @param roles Array of all available roles with their permissions
 * @returns true if user has this permission from roles
 */
export function hasRolePermission(
	scope: string,
	action: string,
	roleIds: string[],
	roles: { _id: string, permissions: Permission<unknown>[] }[],
): boolean {
	const rolePermissions = calculateRolePermissions(roleIds, roles);
	return rolePermissions.some(
		permission => permission.scope === scope && permission.action === action,
	);
}
