/* * */

import { BaseDocumentSchema, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PlanAppHubPublishGtfsCmSchema } from './app-hub-publish-gtfs-cm.js';
import { PlanAppHubPublishGtfsSchema } from './app-hub-publish-gtfs.js';
import { PlanAppOrganizerSchema } from './app-organizer.js';
import { PlanAppRidesFeederSchema } from './app-rides-feeder.js';

/* * */

export const PlanSchema = BaseDocumentSchema.extend({
	active_from: OperationalDateIntSchema,
	active_until: OperationalDateIntSchema,
	agency_id: z.string(),
	apex_file_id: z.string().nullable().default(null),
	apps: z.object({
		hub_publish_gtfs: PlanAppHubPublishGtfsSchema,
		hub_publish_gtfs_cm: PlanAppHubPublishGtfsCmSchema,
		organizer: PlanAppOrganizerSchema,
		rides_feeder: PlanAppRidesFeederSchema,
	}).default({}),
	hash: z.string(),
	is_locked: z.boolean().default(false),
	operation_file_id: z.string().nullable().default(null),
});

export const CreatePlanSchema = PlanSchema.omit({ _id: true, updated_at: true });
export const UpdatePlanSchema = CreatePlanSchema.omit({ created_at: true, created_by: true }).partial();

/* * */

export type Plan = z.infer<typeof PlanSchema>;
export type CreatePlanDto = z.infer<typeof CreatePlanSchema>;
export type UpdatePlanDto = z.infer<typeof UpdatePlanSchema>;

/* * */

export const HashablePlanMetadataSchema = PlanSchema.pick({
	_id: true,
	active_from: true,
	active_until: true,
	operation_file_id: true,
});

export type HashablePlanMetadata = z.infer<typeof HashablePlanMetadataSchema>;
