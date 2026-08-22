/* * */

import { z } from 'zod';

import { AgenciesPermissionRegistrySchema } from './scopes/agencies/registry.js';
import { AlertsPermissionRegistrySchema } from './scopes/alerts/registry.js';
import { FaresPermissionRegistrySchema } from './scopes/fares/registry.js';
import { RidesPermissionRegistrySchema } from './scopes/rides/registry.js';
import { SamsPermissionRegistrySchema } from './scopes/sams/registry.js';

/* * */

export const PermissionsRegistrySchema = z.discriminatedUnion('scope', [
	AgenciesPermissionRegistrySchema,
	AlertsPermissionRegistrySchema,
	RidesPermissionRegistrySchema,
	SamsPermissionRegistrySchema,
	FaresPermissionRegistrySchema,
]);

export type PermissionsRegistry = z.infer<typeof PermissionsRegistrySchema>;
