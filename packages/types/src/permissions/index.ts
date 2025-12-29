/* eslint-disable @typescript-eslint/no-extraneous-class */

/* * */

import { AgenciesPermissionSchema } from '@/permissions/agencies.js';
import { AlertsRealtimePermissionSchema, AlertsScheduledPermissionSchema } from '@/permissions/alerts.js';
import { RidesPermissionSchema, SamsPermissionSchema } from '@/permissions/controller.js';
import { DatesPermissionSchema } from '@/permissions/dates.js';
import { FaresPermissionSchema } from '@/permissions/fares.js';
import { GtfsValidationsPermissionSchema } from '@/permissions/gtfs-validations.js';
import { HomePermissionSchema } from '@/permissions/home.js';
import { OrganizationsPermissionSchema } from '@/permissions/organizations.js';
import { PerformancePermissionSchema } from '@/permissions/performance.js';
import { PlansPermissionSchema } from '@/permissions/plans.js';
import { RolesPermissionSchema } from '@/permissions/roles.js';
import { StopsPermissionSchema } from '@/permissions/stops.js';
import { UsersPermissionSchema } from '@/permissions/users.js';
import { z } from 'zod';

/* * */

export const PermissionSchema = z.discriminatedUnion('scope', [
	AgenciesPermissionSchema,
	AlertsScheduledPermissionSchema,
	AlertsRealtimePermissionSchema,
	RidesPermissionSchema,
	SamsPermissionSchema,
	GtfsValidationsPermissionSchema,
	HomePermissionSchema,
	OrganizationsPermissionSchema,
	PerformancePermissionSchema,
	PlansPermissionSchema,
	RolesPermissionSchema,
	StopsPermissionSchema,
	UsersPermissionSchema,
	DatesPermissionSchema,
	FaresPermissionSchema,
]);

export type Permission = z.infer<typeof PermissionSchema>;

/* * */

export type ActionsOf<S extends Permission['scope']> = Extract<Permission, { scope: S }>['action'];

export type PermissionCatalogType = {
	[S in Permission['scope']]: {
		actions: {
			[A in ActionsOf<S>]: A;
		}
		scope: S
	};
};

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
 * PermissionCatalog provides a structured catalog of all available permissions
 * in the system, categorized by scope and their respective actions.
 * Use it to reference required permissions in components and services.
 */
export class PermissionCatalog {
	//

	public static readonly ALLOW_ALL_FLAG = 'allow_all';

	/**
	 * Generates the complete permission catalog by extracting
	 * scopes and actions from the defined PermissionSchema.
	 * @return A catalog object mapping scopes to their actions.
	 */
	static get all() {
		// Initialize catalog object
		const catalog = {};
		// Iterate over each schema option
		for (const schemaOption of PermissionSchema.options) {
		// Extract scope name and actions
			const scopeName = schemaOption.shape.scope.value;
			const actions = schemaOption.shape.action.options;
			// Build catalog entry
			catalog[scopeName] = {
				actions: Object.fromEntries(actions.map((a: string) => [a, a])),
				scope: scopeName,
			};
		}
		// Return the completed catalog
		return catalog as PermissionCatalogType;
	}

	/**
	 * Get a specific permission from a full list by scope and action.
	 * @param permissionEntries The full list of permissions of the user.
	 * @param scope The resource scope of the permission to filter by.
	 * @param action The action of the permission to filter by.
	 * @returns The filtered Permission object or undefined if not found.
	 */
	static get<S extends Permission['scope']>(permissionEntries: Permission[], scope: S, action: ActionsOf<S>): Extract<Permission, { action: ActionsOf<S>, scope: S }> | undefined {
		return permissionEntries.find((p): p is Extract<Permission, { action: ActionsOf<S>, scope: S }> => p.scope === scope && p.action === action);
	}

	/**
	 * Check if a list of permission entries has the requested scope/action pair.
	 * @param permissionEntries The list of permission entries to check against.
	 * @param scope The required scope to check.
	 * @param action The required action to check.
	 * @returns The permission object or undefined if not found.
	 */
	static hasPermission<S extends Permission['scope']>(permissionEntries: Permission[], scope: S, action: ActionsOf<S>): boolean {
		return permissionEntries.find(p => p.scope === scope && p.action === action) !== undefined;
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
	static hasPermissionResource({ action, permissions, resource_key, scope, value }: HasPermissionResourceArgs) {
		//

		//
		// Return false if no permissions

		if (!permissions) return false;

		//
		// Find the permission with the given action and scope

		const foundPermission = permissions.find(p => p.action === action && p.scope === scope);

		if (!foundPermission) return false;

		//
		// Check if value exists in the permission.resources[resource_key]

		const resourceValues = foundPermission['resources']?.[resource_key];

		if (!resourceValues) return false;

		//
		// If resourceValues is an Array, check if value is in the array
		// or if it contains the ALLOW_ALL_FLAG.

		if (Array.isArray(resourceValues) && resourceValues.includes(this.ALLOW_ALL_FLAG)) return true;
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
	 * Sanitizes a list of permissions by removing any entries
	 * that do not correspond to valid scopes and actions
	 * defined in the PermissionCatalog.
	 * @param existingEntries Array of Permission objects to sanitize.
	 * @return A cleaned array containing only valid permissions.
	 */
	static sanitize(existingEntries: Permission[]): Permission[] {
		// Create a new array to hold valid permissions
		const cleanedPermissions: Record<string, Permission> = {};
		// Iterate through each permission entry of the user
		for (const permissionEntry of existingEntries) {
			// Validate the permission entry
			const validationResult = PermissionSchema.safeParse(permissionEntry);
			if (!validationResult.success) continue;
			// Permission is valid; keep it
			cleanedPermissions[`${permissionEntry.scope}:${permissionEntry.action}`] = permissionEntry;
		}
		// Return the cleaned permissions array
		return Object.values(cleanedPermissions);
	}

	//
}
