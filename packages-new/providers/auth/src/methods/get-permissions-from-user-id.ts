/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Permission } from '@tmlmobilidade/go-types-permissions';
import { mergeObjects } from '@tmlmobilidade/utils';

/**
 * Get permissions for a user based on their user ID.
 * @param userId The user ID.
 * @returns The permissions that the user has.
 * @throws An HTTP UNAUTHORIZED error code if user not found.
 */
export async function getPermissionsFromUserId(userId: string): Promise<Permission[]> {
	//

	//
	// Get the user data

	const userData = await goDb.core.users.findById(userId);
	if (!userData) throw new HttpException(HTTP_STATUS.UNAUTHORIZED, 'User not found.');

	//
	// Get the roles data

	const rolesData = await goDb.core.roles.findMany({ _id: { $in: userData.role_ids } });
	const allPermissions = [...rolesData.flatMap(role => role.permissions), ...userData.permissions];

	//
	// Merge the permissions

	const permissionsMap = new Map<string, Permission>();

	for (const permission of allPermissions) {
		const key = `${permission.scope}:${permission.action}`;
		const foundPermission = permissionsMap.get(key);
		if (foundPermission) permissionsMap.set(key, mergeObjects(foundPermission, permission));
		else permissionsMap.set(key, permission);
	}

	return Array.from(permissionsMap.values());
}
