/* * */

import { FileExportBaseSchema } from '@/file-exports/base.js';
import { LinesModeSchema } from '@/offer/rules.js';
import { z } from 'zod';

/* * */

export const PlanPostersExportPropertiesSchema = z.object({
	properties: z.object({
		agency_id: z.string(),
		canvas_profile: z.enum(['0Master.A', '0Master.B', '0Master.C', '0Master.F']).optional(),
		line_ids: z.array(z.string()).min(1).optional(),
		lines_mode: LinesModeSchema.optional(),
		plan_id: z.string(),
	}),
	type: z.literal('plan_posters'),
});

/* CREATE SCHEMA */
/* * */

export const PlanPostersExportSchema = FileExportBaseSchema.extend(PlanPostersExportPropertiesSchema.shape);

/* TYPES */
/* * */

export type PlanPostersExportProperties = z.infer<typeof PlanPostersExportPropertiesSchema>;
