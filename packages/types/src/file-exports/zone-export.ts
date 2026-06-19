/* * */

import { ZoneSchema } from '@/offer/zone.js';
import { z } from 'zod';

/* * */
/* DATA SCHEMA */
export const FlatZoneSchema = z.object({
	/* GENERAL */
	/* * */
	_id: z.string(),
	agency_ids: ZoneSchema.shape.agency_ids,
	code: z.string(),
	name: z.string().min(2).max(100),
});
/* PROPERTIES SCHEMA */
/* * */
export const ZoneExportPropertiesSchema = z.object({
	properties: z.object({

		agencies: ZoneSchema.shape.agency_ids,

		search: z.string().optional().nullable(),
	}),
	type: z.literal('zone'),
});

/* TYPES */
/* * */
export type ZoneExportProperties = z.infer<typeof ZoneExportPropertiesSchema>;
export type ZoneExportData = z.infer<typeof FlatZoneSchema>;
