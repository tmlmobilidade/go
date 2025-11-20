/* eslint-disable @typescript-eslint/no-extraneous-class */

/* * */

import { AgenciesPermissionSchema } from '@/permissions/agencies.js';
import { AlertsRealtimePermissionSchema, AlertsScheduledPermissionSchema } from '@/permissions/alerts.js';
import { RidesPermissionSchema, SamsPermissionSchema } from '@/permissions/controller.js';
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
]);

export type Permission = z.infer<typeof PermissionSchema>;

/* * */

type ActionsOf<S extends Permission['scope']> = Extract<Permission, { scope: S }>['action'];

type PermissionCatalogType = {
	[S in Permission['scope']]: {
		actions: {
			[A in ActionsOf<S>]: A;
		}
		scope: S
	};
};

/**
 * PermissionCatalog provides a structured catalog of all available permissions
 * in the system, categorized by scope and their respective actions.
 * Use it to reference required permissions in components and services.
 */
export class PermissionCatalog {
	//

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
	 * Check if a list of permission entries has the requested scope/action pair.
	 * @param permissionEntries The list of permission entries to check against.
	 * @param scope The required scope to check.
	 * @param action The required action to check.
	 * @returns The permission object or undefined if not found.
	 */
	static hasPermission(permissionEntries: Permission[], scope: string, action: string): boolean {
		return permissionEntries.find(p => p.scope === scope && p.action === action) !== undefined;
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
		const cleanedPermissions: Permission[] = [];
		// Iterate through each permission entry of the user
		for (const permissionEntry of existingEntries) {
			// Check if the scope exists in the catalog
			if (!this.all[permissionEntry.scope]) continue;
			// Check if the action exists in the catalog for the given scope
			if (!this.all[permissionEntry.scope][permissionEntry.action]) continue;
			// Permission is valid; keep it
			cleanedPermissions.push(permissionEntry);
		}
		// Return the cleaned permissions array
		return cleanedPermissions;
	}

	//
}
