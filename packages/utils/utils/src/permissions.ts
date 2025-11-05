/* eslint-disable @typescript-eslint/no-explicit-any */
/* * */

import { ALLOW_ALL_FLAG } from '@go/lib';
import { type Permission } from '@go/types';
import { mergekit } from 'mergekit';

/**
 * Get a permission from a list of permissions
 * @param permissions - The list of permissions
 * @param scope - The scope of the permission
 * @param action - The action of the permission
 * @returns The permission
 */
export function getPermission(permissions: Permission<unknown>[], scope: string, action: string): Permission<unknown> {
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
export function hasPermission(permissions: Permission<unknown>[], scope: string, action: string): boolean {
	return permissions.find(permission => permission.scope === scope && permission.action === action) !== undefined;
}

export interface HasPermissionResourceArgs<T> {
	action: string
	permissions?: Permission<T>[]
	resource_key: keyof T
	scope: string
	value: unknown
}

type HasPermissionResourceArgsWithPermissions<T> =
  HasPermissionResourceArgs<T> & { permissions: Permission<T>[] };

/**
 * Check if a value exists in a resource of a permission
 * @param permissions - The list of permissions
 * @param value - The value to check
 * @param resource_key - The key of the resource
 * @param scope - The scope of the permission
 * @param action - The action of the permission
 * @returns The permission
 */
export function hasPermissionResource<T>({ action, permissions, resource_key, scope, value }: HasPermissionResourceArgsWithPermissions<T>) {
	if (!permissions)
		return false;

	const permission = permissions.find(permission => permission.action === action && permission.scope === scope);
	if (!permission)
		return false;

	// Check if value exists in the permission.resource[resource_key]
	const resourceValues = permission.resource?.[resource_key];
	if (!resourceValues) return false;

	// If is Array
	if (Array.isArray(resourceValues) && resourceValues.includes(ALLOW_ALL_FLAG)) return true;
	if (Array.isArray(resourceValues) && resourceValues.includes(value)) return true;

	// If is not Array, check if value is equal to resourceValues
	if (resourceValues === value) return true;

	return false;
}

/**
 * Ensure a permission is granted in a fastify request
 * @param request - The FastifyRequest
 * @param reply - The FastifyReply
 * @param params - The parameters of the permission
 * @returns The allowed
 */
export function hasAPIResourcePermission<T>(request: any, params: HasPermissionResourceArgs<T>): boolean {
	const allowed = hasPermissionResource<T>({
		action: params.action,
		permissions: request.permissions as Permission<T>[],
		resource_key: params.resource_key,
		scope: params.scope,
		value: params.value,
	});

	return allowed;
}
