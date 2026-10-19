/* * */

import { BaseDocumentSchema, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PlanAppsSchema } from './apps.js';
import { PlanAttachmentsSchema } from './attachments.js';

/* * */

export const PlanSchema = BaseDocumentSchema.extend({
	active_from: OperationalDateIntSchema,
	active_until: OperationalDateIntSchema,
	agency_id: z.string(),
	apps: PlanAppsSchema,
	attachments: PlanAttachmentsSchema,
	hash: z.string(),
	is_locked: z.boolean().default(false),
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
}).extend({
	operation_gtfs_hash: z.string(),
	operation_gtfs_normalized_hash: z.string().nullable().default(null),
});

export type HashablePlanMetadata = z.infer<typeof HashablePlanMetadataSchema>;
