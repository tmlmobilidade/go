/* * */

import { z } from 'zod';

import { AgenciesPermissionRegistrySchema } from './scopes/agencies/registry.js';
import { AlertsPermissionRegistrySchema } from './scopes/alerts/registry.js';

/* * */

export const PermissionsRegistrySchema = z.discriminatedUnion('scope', [
	AgenciesPermissionRegistrySchema,
	AlertsPermissionRegistrySchema,
]);

export type PermissionsRegistry = z.infer<typeof PermissionsRegistrySchema>;
