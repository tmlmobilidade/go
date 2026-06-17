/* * */

import { roles, users } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Sanitizes permissions in both the "users" and "roles" collections.
 */
export async function sanitizePermissions() {
	try {
		//

		Logger.info({ message: `Starting permission sanitization...` });

		//
		// Fetch all Users and sanitize their permissions

		const usersTimer = new Timer();

		const allUsers = await users.findMany();

		for (const user of allUsers) {
			const sanitizedPermissions = PermissionCatalog.sanitize(user.permissions);
			await users.updateById(user._id, { permissions: sanitizedPermissions });
		}

		Logger.success(`Updated ${allUsers.length} users with sanitized permissions in ${usersTimer.get()}.`);

		//
		// Fetch all Roles and sanitize their permissions

		const rolesTimer = new Timer();

		const allRoles = await roles.findMany();

		for (const role of allRoles) {
			const sanitizedPermissions = PermissionCatalog.sanitize(role.permissions);
			await roles.updateById(role._id, { permissions: sanitizedPermissions });
		}

		Logger.success(`Updated ${allRoles.length} roles with sanitized permissions in ${rolesTimer.get()}.`);
	} catch (error) {
		Logger.error({ error, message: `Failed to sanitize permissions:` });
	}
}
