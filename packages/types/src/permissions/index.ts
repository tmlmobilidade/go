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
}
