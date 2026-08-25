/* * */

import { AllowAllFlagValue } from '@/allow-all.js';
import { PermissionsResources } from '@/resources-registy.js';

import { type Permission } from '../permissions.js';

/* * */

interface HasPermissionResourceRequirements {

	/**
	 * The required permission to check.
	 */
	requiredPermission: Omit<Permission, 'resources'>

	/**
	 * The required value to check.
	 */
	requiredValue: string

	/**
	 * The key of the resource.
	 */
	resourceKey: keyof PermissionsResources
}

/**
 * Check if a permission exists in a list of permissions, with additional check for a given resource value.
 * If a `value` exists in a `resource` of a User `permissions` object that
 * matches the given `action` and `scope`. For example, if you want to check if
 * a user has access to a specific `agency_id`, you set `value=43` and `resource_key='agency_ids'`.
 * If the provided `permissions` object contains the value `43` inside the `scope='plans'`,
 * `action='create'` and `resource_key='agency_ids'` the function will return true.
 * @param userPermissions The list of permissions (from a user or request).
 * @param requirements The requirements to check for.
 * @returns True if the permission is found, false otherwise.
 */
export function hasPermissionResource(userPermissions: Permission[], { requiredPermission, requiredValue, resourceKey }: HasPermissionResourceRequirements) {
	//

	//
	// Return false if no permissions

	if (!userPermissions?.length) return false;

	if (!resourceKey || !requiredValue) return false;

	//
	// Find the permission with the given action and scope

	const foundUserPermission = userPermissions.find(p => p.action === requiredPermission.action && p.scope === requiredPermission.scope);

	if (!foundUserPermission) return false;

	//
	// Exit if the found user permission does not have the resources property
	// or if the resources property is empty

	if (!('resources' in foundUserPermission)) return false;

	const resourceValues: string[] = foundUserPermission.resources[resourceKey];

	if (!resourceValues?.length) return false;

	//
	// Check if the found user permission can access all values
	// or has the required value

	if (resourceValues.includes(AllowAllFlagValue)) return true;

	return resourceValues.includes(requiredValue);
}
