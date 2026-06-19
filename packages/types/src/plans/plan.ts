/* * */

import { GtfsAgencySchema } from '@/gtfs/agency.js';
import { GtfsFeedInfoSchema } from '@/gtfs/feed-info.js';
import { PlanAppStatusSchema } from '@/plans/plan-app-status.js';
import { PlanPcgiLegacySchema } from '@/plans/plan-pcgi-legacy.js';
import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const PlanSchema = DocumentSchema.extend({
	apps: z.object({
		controller: PlanAppStatusSchema,
		hub_gtfs: PlanAppStatusSchema,
		hub_schedules: PlanAppStatusSchema,
		merger: PlanAppStatusSchema,
		posters: PlanAppStatusSchema,
	}).default({}),
	gtfs_agency: GtfsAgencySchema,
	gtfs_feed_info: GtfsFeedInfoSchema,
	hash: z.string(),
	is_locked: z.boolean().default(false),
	operation_file_id: z.string(),
	pcgi_legacy: PlanPcgiLegacySchema,
});

export const CreatePlanSchema = PlanSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdatePlanSchema = CreatePlanSchema.omit({ created_by: true }).partial();

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
