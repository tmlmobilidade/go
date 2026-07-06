/* * */

import { FileExportBaseSchema } from '@/file-exports/base.js';
import { LinesModeSchema } from '@/offer/rules.js';
import { OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

/* PROPERTIES SCHEMA */
/* * */
export const GtfsExportPropertiesSchema = z.object({
	properties: z.object({
		agency_ids: z.array(z.string()),
		calendars_clip_end_date: OperationalDateSchema,
		calendars_clip_start_date: OperationalDateSchema,
		feed_end_date: OperationalDateSchema,
		feed_start_date: OperationalDateSchema,
		lines_exclude: z.array(z.string()).default([]),
		lines_include: z.array(z.string()).default([]),
		lines_mode: LinesModeSchema.default('all'),
		numeric_calendar_codes: z.boolean().default(false),
		stop_sequence_start: z.number().default(1),
		stops_export_all: z.boolean().default(true),
	}),
	type: z.literal('gtfs'),
});

/* CREATE SCHEMA */
/* * */
export const GtfsExportSchema = FileExportBaseSchema.extend(GtfsExportPropertiesSchema.shape);

/* TYPES */
/* * */
export type GtfsExportProperties = z.infer<typeof GtfsExportPropertiesSchema>;
