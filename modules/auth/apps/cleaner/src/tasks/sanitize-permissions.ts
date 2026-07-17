/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';

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

		const allUsers = await goDB.core.users.findMany({});

		for (const user of allUsers) {
			const sanitizedPermissions = PermissionCatalog.sanitize(user.permissions);
			await goDB.core.users.updateById(user._id, { permissions: sanitizedPermissions });
		}

		Logger.success(`Updated ${allUsers.length} users with sanitized permissions in ${usersTimer.get()}.`);

		//
		// Fetch all Roles and sanitize their permissions

		const rolesTimer = new Timer();

		const allRoles = await goDB.core.roles.findMany();

		for (const role of allRoles) {
			const sanitizedPermissions = PermissionCatalog.sanitize(role.permissions);
			await goDB.core.roles.updateById(role._id, { permissions: sanitizedPermissions });
		}

		Logger.success(`Updated ${allRoles.length} roles with sanitized permissions in ${rolesTimer.get()}.`);
	} catch (error) {
		Logger.error({ error, message: `Failed to sanitize permissions:` });
	}
}
