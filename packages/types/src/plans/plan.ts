/* * */

import { DocumentSchema } from '@/_common/document.js';
import { ProcessingStatusSchema } from '@/_common/status.js';
import { GtfsAgencySchema } from '@/gtfs/agency.js';
import { GtfsFeedInfoSchema } from '@/gtfs/feed-info.js';
import { PlanControllerSchema } from '@/plans/plan-controller.js';
import { PlanPcgiLegacySchema } from '@/plans/plan-pcgi-legacy.js';
import { z } from 'zod';

/* * */

export const PlanSchema = DocumentSchema.extend({
	controller: PlanControllerSchema,
	gtfs_agency: GtfsAgencySchema,
	gtfs_feed_info: GtfsFeedInfoSchema,
	hash: z.string(),
	is_locked: z.boolean().default(false),
	operation_file_id: z.string(),
	pcgi_legacy: PlanPcgiLegacySchema,
	status_merger: ProcessingStatusSchema.default('waiting'),
}).strict();

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

/* * */

export const PlanPermissionSchema = z.object({
	agency_ids: z.array(z.string()),
});

export type PlanPermission = z.infer<typeof PlanPermissionSchema>;
