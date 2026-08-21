/* * */

import { z } from 'zod';

import { AgenciesPermissionSchema } from './scopes/agencies.js';
import { AlertsPermissionSchema } from './scopes/alerts.js';
import { RidesPermissionSchema, SamsPermissionSchema } from './scopes/controller.js';
import { AnnotationsPermissionSchema, EventsPermissionSchema, HolidaysPermissionSchema, YearPeriodsPermissionSchema } from './scopes/dates.js';
import { FaresPermissionSchema } from './scopes/fares.js';
import { GtfsValidationsPermissionSchema } from './scopes/gtfs-validations.js';
import { HomePermissionSchema } from './scopes/home.js';
import { LinesPermissionSchema } from './scopes/lines.js';
import { OrganizationsPermissionSchema } from './scopes/organizations.js';
import { PerformancePermissionSchema } from './scopes/performance.js';
import { PlansPermissionSchema } from './scopes/plans.js';
import { RolesPermissionSchema } from './scopes/roles.js';
import { StopsPermissionSchema } from './scopes/stops.js';
import { TypologiesPermissionSchema } from './scopes/typologies.js';
import { UsersPermissionSchema } from './scopes/users.js';
import { VehiclesPermissionSchema } from './scopes/vehicles.js';
import { ZonesPermissionSchema } from './scopes/zones.js';

/* * */

export const PermissionSchema = z.discriminatedUnion('scope', [
	AgenciesPermissionSchema,
	AlertsPermissionSchema,
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
	VehiclesPermissionSchema,
	FaresPermissionSchema,
	AnnotationsPermissionSchema,
	YearPeriodsPermissionSchema,
	HolidaysPermissionSchema,
	EventsPermissionSchema,
	ZonesPermissionSchema,
	TypologiesPermissionSchema,
	LinesPermissionSchema,
]);

export type Permission = z.infer<typeof PermissionSchema>;
