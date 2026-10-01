/* * */

import { z } from 'zod';

import { AgenciesPermissionSchema } from './scopes/agencies/permission.js';
import { AlertsPermissionSchema } from './scopes/alerts/permission.js';
import { AnnotationsPermissionSchema } from './scopes/annotations/permission.js';
import { EventsPermissionSchema } from './scopes/events/permission.js';
import { FaresPermissionSchema } from './scopes/fares/permission.js';
import { GtfsValidationsPermissionSchema } from './scopes/gtfs-validations/permission.js';
import { HolidaysPermissionSchema } from './scopes/holidays/permission.js';
import { HomePermissionSchema } from './scopes/home/permission.js';
import { LinesPermissionSchema } from './scopes/lines/permission.js';
import { OrganizationsPermissionSchema } from './scopes/organizations/permission.js';
import { PerformancePermissionSchema } from './scopes/performance/permission.js';
import { PlansPermissionSchema } from './scopes/plans/permission.js';
import { RidesPermissionSchema } from './scopes/rides/permission.js';
import { RolesPermissionSchema } from './scopes/roles/permission.js';
import { SamsPermissionSchema } from './scopes/sams/permission.js';
import { SchoolsPermissionSchema } from './scopes/schools/permission.js';
import { StopsPermissionSchema } from './scopes/stops/permission.js';
import { TypologiesPermissionSchema } from './scopes/typologies/permission.js';
import { UsersPermissionSchema } from './scopes/users/permission.js';
import { VehiclesPermissionSchema } from './scopes/vehicles/permission.js';
import { YearPeriodsPermissionSchema } from './scopes/year-periods/permission.js';
import { ZonesPermissionSchema } from './scopes/zones/permission.js';

/* * */

export const PermissionSchema = z.discriminatedUnion('scope', [
	AgenciesPermissionSchema,
	AlertsPermissionSchema,
	AnnotationsPermissionSchema,
	EventsPermissionSchema,
	FaresPermissionSchema,
	GtfsValidationsPermissionSchema,
	HolidaysPermissionSchema,
	HomePermissionSchema,
	LinesPermissionSchema,
	OrganizationsPermissionSchema,
	PerformancePermissionSchema,
	PlansPermissionSchema,
	RidesPermissionSchema,
	RolesPermissionSchema,
	SamsPermissionSchema,
	SchoolsPermissionSchema,
	StopsPermissionSchema,
	TypologiesPermissionSchema,
	UsersPermissionSchema,
	VehiclesPermissionSchema,
	YearPeriodsPermissionSchema,
	ZonesPermissionSchema,
]);

export type Permission = z.infer<typeof PermissionSchema>;
