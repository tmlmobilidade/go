/* * */

import { FileExportBaseSchema } from '@/base.js';
import { z } from 'zod';

/* * */

export const PlanExportPropertiesSchema = z.object({
	properties: z.object({
		agency_id: z.string(),
		plan_id: z.string(),
	}),
	type: z.literal('plan'),
});

/* CREATE SCHEMA */
/* * */
export const PlanExportSchema = FileExportBaseSchema.extend(PlanExportPropertiesSchema.shape);

/* TYPES */
/* * */
export type PlanExportProperties = z.infer<typeof PlanExportPropertiesSchema>;
