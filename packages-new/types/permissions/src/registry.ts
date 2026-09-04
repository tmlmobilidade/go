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
import { SchoolsPermissionRegistrySchema } from './scopes/schools/registry.js';
import { StopsPermissionRegistrySchema } from './scopes/stops/registry.js';
import { TypologiesPermissionRegistrySchema } from './scopes/typologies/registry.js';
import { UsersPermissionRegistrySchema } from './scopes/users/registry.js';
import { VehiclesPermissionRegistrySchema } from './scopes/vehicles/registry.js';
import { YearPeriodsPermissionRegistrySchema } from './scopes/year-periods/registry.js';
import { ZonesPermissionRegistrySchema } from './scopes/zones/registry.js';

/* * */

export const PermissionsRegistrySchema = z.discriminatedUnion('scope', [
	AgenciesPermissionRegistrySchema,
	AlertsPermissionRegistrySchema,
	AnnotationsPermissionRegistrySchema,
	EventsPermissionRegistrySchema,
	FaresPermissionRegistrySchema,
	GtfsValidationsPermissionRegistrySchema,
	HolidaysPermissionRegistrySchema,
	HomePermissionRegistrySchema,
	LinesPermissionRegistrySchema,
	OrganizationsPermissionRegistrySchema,
	PerformancePermissionRegistrySchema,
	PlansPermissionRegistrySchema,
	RidesPermissionRegistrySchema,
	RolesPermissionRegistrySchema,
	SamsPermissionRegistrySchema,
	SchoolsPermissionRegistrySchema,
	StopsPermissionRegistrySchema,
	TypologiesPermissionRegistrySchema,
	UsersPermissionRegistrySchema,
	VehiclesPermissionRegistrySchema,
	YearPeriodsPermissionRegistrySchema,
	ZonesPermissionRegistrySchema,
]);

export type PermissionsRegistry = z.infer<typeof PermissionsRegistrySchema>;
