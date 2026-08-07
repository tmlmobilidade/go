/* * */

import { FileExportBaseSchema } from '@/file-exports/base.js';
import { z } from 'zod';

/* * */

export const PlanPostersExportPropertiesSchema = z.object({
	properties: z.object({
		agency_id: z.string(),
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
