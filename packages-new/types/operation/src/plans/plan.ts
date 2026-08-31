/* * */

import { PlanAppStatusSchema } from '@/plans/plan-app-status.js';
import { PlanPcgiLegacySchema } from '@/plans/plan-pcgi-legacy.js';
import { GtfsStrictV30AgencySchema, GtfsStrictV30FeedInfoSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { BaseDocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const PlanSchema = BaseDocumentSchema.extend({
	agency_id: z.string(),
	apex_file_id: z.string().nullable().default(null),
	apps: z.object({
		controller: PlanAppStatusSchema,
		hub_gtfs: PlanAppStatusSchema,
		hub_schedules: PlanAppStatusSchema,
		merger: PlanAppStatusSchema,
	}),
	gtfs_agency: GtfsStrictV30AgencySchema,
	gtfs_feed_info: GtfsStrictV30FeedInfoSchema,
	hash: z.string(),
	is_locked: z.boolean().default(false),
	operation_file_id: z.string().nullable().default(null),
	pcgi_legacy: PlanPcgiLegacySchema,
});

export const CreatePlanSchema = PlanSchema.omit({ _id: true, updated_at: true });
export const UpdatePlanSchema = CreatePlanSchema.omit({ created_at: true, created_by: true }).partial();

/* * */

export type Plan = z.infer<typeof PlanSchema>;
export type CreatePlanDto = z.infer<typeof CreatePlanSchema>;
export type UpdatePlanDto = z.infer<typeof UpdatePlanSchema>;

/* * */

export interface HashablePlanMetadata {
	_id: Plan['_id']
	gtfs_agency: Plan['gtfs_agency']
	gtfs_feed_info: Plan['gtfs_feed_info']
	operation_file_id: Plan['operation_file_id']
}
