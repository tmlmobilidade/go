/* * */

import { FileExportBaseSchema } from '@/base.js';
import { LinesModeSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

/* * */

export const PlanPostersContentModeSchema = z.enum(['all', 'lines', 'stops']);
export const PlanPostersFilterModeSchema = z.enum(['exclude', 'include']);

/* * */

export const PlanPostersExportPropertiesSchema = z.object({
	properties: z.object({
		agency_id: z.string(),
		canvas_profile: z.enum(['0Master.A', '0Master.B', '0Master.C', '0Master.F']).optional(),
		content_mode: PlanPostersContentModeSchema.optional(),
		line_ids: z.array(z.string()).min(1).optional(),
		lines_mode: LinesModeSchema.optional(),
		plan_id: z.string(),
		stop_ids: z.array(z.string()).min(1).optional(),
		stops_mode: PlanPostersFilterModeSchema.optional(),
	}),
	type: z.literal('plan_posters'),
});

/* CREATE SCHEMA */
/* * */

export const PlanPostersExportSchema = FileExportBaseSchema.extend(PlanPostersExportPropertiesSchema.shape);

/* TYPES */
/* * */

export type PlanPostersContentMode = z.infer<typeof PlanPostersContentModeSchema>;
export type PlanPostersExportProperties = z.infer<typeof PlanPostersExportPropertiesSchema>;
export type PlanPostersFilterMode = z.infer<typeof PlanPostersFilterModeSchema>;
