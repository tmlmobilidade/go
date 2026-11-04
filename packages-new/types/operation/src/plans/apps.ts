/* * */

import { z } from 'zod';

import { PlanAppHubPublishGtfsSchema } from './app-hub-publish-gtfs.js';
import { PlanAppOrganizerSchema } from './app-organizer.js';
import { PlanAppRidesFeederSchema } from './app-rides-feeder.js';
import { PlanAppStatisticsSchema } from './app-statistics.js';

/* * */

export const PlanAppsSchema = z.object({
	hub_publish_gtfs: PlanAppHubPublishGtfsSchema,
	organizer: PlanAppOrganizerSchema,
	plans_statistics: PlanAppStatisticsSchema.optional(),
	rides_feeder: PlanAppRidesFeederSchema,
}).default({});

export type PlanApps = z.infer<typeof PlanAppsSchema>;
