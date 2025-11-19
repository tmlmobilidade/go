/* eslint-disable @typescript-eslint/no-explicit-any */

/* * */

import { ALLOW_ALL_FLAG } from '@tmlmobilidade/consts';
import { type Permission } from '@tmlmobilidade/types';
import { mergekit } from 'mergekit';

/**
 * Get a scope and action filtered Permission object
 * from a list of User permissions.
 * @param permissions The full list of permissions of the user.
 * @param scope The resource scope of the permission to filter by.
 * @param action The action of the permission to filter by.
 * @returns The filtered Permission object.
 */
export function getPermission(permissions: Permission[], scope: string, action: string): Permission {
	return mergekit([...(permissions ?? [])], {
		appendArrays: true,
		dedupArrays: true,
		onlyObjectWithKeyValues: [
			{ key: 'scope', value: scope },
			{ key: 'action', value: action },
		],
	});
}

/**
 * Check if a permission exists in a list of permissions.
 * @param permissions The list of permissions.
 * @param scope The scope of the permission.
 * @param action The action of the permission.
 * @returns The permission object or undefined if not found.
 */
export function hasPermission(permissions: Permission[], scope: string, action: string): boolean {
	return permissions.find(permission => permission.scope === scope && permission.action === action) !== undefined;
}

/**
 * Arguments for hasPermissionResource function.
 * @param T The type of the resource.
 */
export interface HasPermissionResourceArgs {
	action: string
	permissions: Permission[]
	resource_key: string
	scope: string
	value: unknown
}

/**
 * Check if a permission exists in a list of permissions, with additional check for a given resource value.
 * If a `value` exists in a `resource` of a User `permissions` object that
 * matches the given `action` and `scope`. For example, if you want to check if
 * a user has access to a specific `agency_id`, you set `value=43` and `resource_key='agency_ids'`.
 * If the provided `permissions` object contains the value `43` inside the `scope='plans'`,
 * `action='create'` and `resource_key='agency_ids'` the function will return true.
 * @param permissions The list of permissions (from a user or request).
 * @param value The permission value to check against.
 * @param resource_key The key of the resource.
 * @param scope The scope of the permission.
 * @param action The action of the permission.
 * @returns The permission.
 */
export function hasPermissionResource({ action, permissions, resource_key, scope, value }: HasPermissionResourceArgs) {
	//

	//
	// Return false if no permissions

	if (!permissions) return false;

	//
	// Find the permission with the given action and scope

	const foundPermission = permissions.find(permission => permission.action === action && permission.scope === scope);

	if (!foundPermission) return false;

	//
	// Check if value exists in the permission.resource[resource_key]

	const resourceValues = foundPermission['resource']?.[resource_key];

	if (!resourceValues) return false;

	//
	// If resourceValues is an Array, check if value is in the array
	// or if it contains the ALLOW_ALL_FLAG.

	if (Array.isArray(resourceValues) && resourceValues.includes(ALLOW_ALL_FLAG)) return true;
	if (Array.isArray(resourceValues) && resourceValues.includes(value)) return true;

	//
	// If resourceValues is not an Array, check if it is equal to the requested value

	if (resourceValues === value) return true;

	//
	// Otherwise, return false

	return false;

	//
}

/**
 * Check if a value exists in a resource of a permission from Fastify request.
 * @param request The FastifyRequest.
 * @param params The parameters for checking permission.
 * @returns True if the user has the requested permission, false otherwise.
 * @deprecated Use hasPermissionResource instead.
 */
export function hasAPIResourcePermission(request: any, params: HasPermissionResourceArgs): boolean {
	return hasPermissionResource({
		action: params.action,
		permissions: request.permissions as Permission[],
		resource_key: params.resource_key,
		scope: params.scope,
		value: params.value,
	});
}
