/* * */

import { z } from 'zod';

import { AgenciesPermissionRegistrySchema } from './scopes/agencies/registry.js';
import { AlertsPermissionRegistrySchema } from './scopes/alerts/registry.js';
import { AnnotationsPermissionRegistrySchema } from './scopes/annotations/registry.js';
import { EventsPermissionRegistrySchema } from './scopes/events/registry.js';
import { FaresPermissionRegistrySchema } from './scopes/fares/registry.js';
import { GtfsValidationsPermissionRegistrySchema } from './scopes/gtfs-validations/registry.js';
import { HolidaysPermissionRegistrySchema } from './scopes/holidays/registry.js';
import { HomePermissionRegistrySchema } from './scopes/home/registry.js';
import { LinesPermissionRegistrySchema } from './scopes/lines/registry.js';
import { OrganizationsPermissionRegistrySchema } from './scopes/organizations/registry.js';
import { PerformancePermissionRegistrySchema } from './scopes/performance/registry.js';
import { PlansPermissionRegistrySchema } from './scopes/plans/registry.js';
import { RidesPermissionRegistrySchema } from './scopes/rides/registry.js';
import { RolesPermissionRegistrySchema } from './scopes/roles/registry.js';
import { SamsPermissionRegistrySchema } from './scopes/sams/registry.js';
import { YearPeriodsPermissionRegistrySchema } from './scopes/year-periods/registry.js';

/* * */

export const PermissionsRegistrySchema = z.discriminatedUnion('scope', [
	AgenciesPermissionRegistrySchema,
	AlertsPermissionRegistrySchema,
	RidesPermissionRegistrySchema,
	SamsPermissionRegistrySchema,
	FaresPermissionRegistrySchema,
	EventsPermissionRegistrySchema,
	AnnotationsPermissionRegistrySchema,
	HolidaysPermissionRegistrySchema,
	YearPeriodsPermissionRegistrySchema,
	GtfsValidationsPermissionRegistrySchema,
	HomePermissionRegistrySchema,
	LinesPermissionRegistrySchema,
	OrganizationsPermissionRegistrySchema,
	PerformancePermissionRegistrySchema,
	PlansPermissionRegistrySchema,
	RolesPermissionRegistrySchema,
]);

export type PermissionsRegistry = z.infer<typeof PermissionsRegistrySchema>;
