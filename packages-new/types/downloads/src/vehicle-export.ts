/* * */

import { z } from 'zod';

import { FileExportBaseSchema } from './base.js';

/* * */
/* PROPERTIES SCHEMA */
export const VehicleExportPropertiesSchema = z.object({
	properties: z.object({
		agency_ids: z.array(z.string()).optional().nullable(),

		search: z.string().optional().nullable(),

		vehicle_ids: z.array(z.string()).optional().nullable(),
	}),
	type: z.literal('vehicle'),
});

/* CREATE SCHEMA */
/* * */
export const VehicleExportSchema = FileExportBaseSchema.extend(VehicleExportPropertiesSchema.shape);

/* TYPES */
/* * */
export type VehicleExportProperties = z.infer<typeof VehicleExportPropertiesSchema>;
