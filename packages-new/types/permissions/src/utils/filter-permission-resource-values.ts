/* * */

import { AllowAllFlagValue } from '@/allow-all.js';

import { type ActionsOf } from '../catalog.js';
import { type Permission } from '../permissions.js';

/**
 * Arguments for filterPermissionResourceValues function.
 * @param T The type of the resource.
 */
export interface FilterPermissionResourceValuesArgs<TValue = string> {
	action: ActionsOf<Permission['scope']>
	permissions: Permission[]
	resourceKey: string
	scope: Permission['scope']
	values: TValue[] | undefined
}

/**
 * Filters requested resource values to only those the user is permitted to access.
 * Unlike `hasPermissionResource`, which answers whether access should be granted,
 * this method returns the subset of requested values that are actually permitted.
 * An empty `values` array means no resource filter was requested, so all values
 * are returned unchanged.
 * @param permissions The list of permissions from a user or request.
 * @param scope The scope of the permission.
 * @param action The action of the permission.
 * @param resourceKey The resource key containing the allowed values.
 * @param values The resource values requested by the caller.
 * @returns Only the requested values that the user is permitted to access.
 */
export function filterPermissionResourceValues<TValue = string>({ action, permissions, resourceKey, scope, values }: FilterPermissionResourceValuesArgs<TValue>): TValue[] {
	// No filter was requested, so preserve the original values.
	if (!values || values.length === 0) return values ?? [];

	if (!permissions?.length) return [];

	const allowedValues = new Set<TValue>();

	// Collect resource values from every matching permission.
	for (const permission of permissions) {
		if (permission.scope !== scope || permission.action !== action) {
			continue;
		}

		const resourceValues = permission['resources']?.[resourceKey];

		if (!resourceValues) continue;

		// The allow-all flag grants access to every requested value.
		if (
			Array.isArray(resourceValues) &&
			resourceValues.includes(AllowAllFlagValue)
		) {
			return values;
		}

		if (Array.isArray(resourceValues)) {
			for (const resourceValue of resourceValues) {
				allowedValues.add(resourceValue as TValue);
			}
		} else {
			allowedValues.add(resourceValues as TValue);
		}
	}

	// Return only requested values that exist in the user's allowed resources.
	return values.filter(value => allowedValues.has(value));
}
