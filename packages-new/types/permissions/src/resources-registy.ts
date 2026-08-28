/* * */

import { z } from 'zod';

import { AlertsPermissionResourcesSchema } from './scopes/alerts/resources.js';
import { AnnotationsPermissionResourcesSchema } from './scopes/annotations/resources.js';
import { EventsPermissionResourcesSchema } from './scopes/events/resources.js';
import { FaresPermissionResourcesSchema } from './scopes/fares/resources.js';
import { GtfsValidationsPermissionResourcesSchema } from './scopes/gtfs-validations/resources.js';
import { HolidaysPermissionResourcesSchema } from './scopes/holidays/resources.js';
import { LinesPermissionResourcesSchema } from './scopes/lines/resources.js';
import { PlansPermissionResourcesSchema } from './scopes/plans/resources.js';
import { RidesPermissionResourcesSchema } from './scopes/rides/resources.js';
import { SamsPermissionResourcesSchema } from './scopes/sams/resources.js';
import { StopsPermissionResourcesSchema } from './scopes/stops/resources.js';
import { TypologiesPermissionResourcesSchema } from './scopes/typologies/resources.js';
import { VehiclesPermissionResourcesSchema } from './scopes/vehicles/resources.js';
import { YearPeriodsPermissionResourcesSchema } from './scopes/year-periods/resources.js';
import { ZonesPermissionResourcesSchema } from './scopes/zones/resources.js';

/* * */

export const PermissionsResourcesSchema = AlertsPermissionResourcesSchema
	.merge(AnnotationsPermissionResourcesSchema)
	.merge(EventsPermissionResourcesSchema)
	.merge(FaresPermissionResourcesSchema)
	.merge(GtfsValidationsPermissionResourcesSchema)
	.merge(HolidaysPermissionResourcesSchema)
	.merge(LinesPermissionResourcesSchema)
	.merge(PlansPermissionResourcesSchema)
	.merge(RidesPermissionResourcesSchema)
	.merge(SamsPermissionResourcesSchema)
	.merge(StopsPermissionResourcesSchema)
	.merge(TypologiesPermissionResourcesSchema)
	.merge(VehiclesPermissionResourcesSchema)
	.merge(YearPeriodsPermissionResourcesSchema)
	.merge(ZonesPermissionResourcesSchema);

export type PermissionsResources = z.infer<typeof PermissionsResourcesSchema>;
