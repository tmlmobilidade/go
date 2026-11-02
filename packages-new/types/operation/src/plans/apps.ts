/* * */

import { z } from 'zod';

import { PlanAppHubPublishGtfsSchema } from './app-hub-publish-gtfs.js';
import { PlanAppOrganizerSchema } from './app-organizer.js';
import { PlanAppRidesFeederSchema } from './app-rides-feeder.js';

/* * */

export const PlanAppsSchema = z.object({
	hub_publish_gtfs: PlanAppHubPublishGtfsSchema,
	organizer: PlanAppOrganizerSchema,
	rides_feeder: PlanAppRidesFeederSchema,
}).default({});

export type PlanApps = z.infer<typeof PlanAppsSchema>;
