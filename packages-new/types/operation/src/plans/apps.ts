/* * */

import { z } from 'zod';

import { PlanAppHubPublishGtfsSchema } from './app-hub-publish-gtfs.js';
import { PlanAppOrganizerSchema } from './app-organizer.js';
import { PlanAppStatisticsSchema } from './app-plans-statistics.js';
import { PlanAppRidesFeederSchema } from './app-rides-feeder.js';

/* * */

export const PlanAppsSchema = z.object({
	hub_publish_gtfs: PlanAppHubPublishGtfsSchema,
	organizer: PlanAppOrganizerSchema,
	plans_statistics: PlanAppStatisticsSchema.optional(),
	rides_feeder: PlanAppRidesFeederSchema,
}).prefault({});

export type PlanApps = z.infer<typeof PlanAppsSchema>;
