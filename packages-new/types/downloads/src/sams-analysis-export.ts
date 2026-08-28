/* * */

import { FileExportBaseSchema } from '@/base.js';
import { SamAnalysisSchema } from '@tmlmobilidade/go-types-operation';
import { SystemStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

/* ANALYSIS SCHEMA */
/* * */
export const FlatSamsAnalysisExportAnalysisSchema = SamAnalysisSchema.extend({
	_id: z.number().optional().nullable(),
	agency_id: z.string().optional().nullable(),
});

/* PROPERTIES SCHEMA */
/* * */
export const SamsAnalysisExportPropertiesSchema = z.object({
	properties: z.object({
		_id: z.array(z.number()).optional().nullable(),
		agency_ids: z.array(z.string()).optional().nullable(),
		apex_versions: z.array(z.string()).optional().nullable(),
		end_time: UnixMillisecondsSchema.optional().nullable(),
		favorites_only: z.boolean().optional().nullable(),
		sam_ids: z.array(z.number()).optional().nullable(),
		search: z.string().optional().nullable(),
		seen_first_at: UnixMillisecondsSchema.optional().nullable(),
		seen_last_at: UnixMillisecondsSchema.optional().nullable(),
		start_time: UnixMillisecondsSchema.optional().nullable(),
		statuses: z.array(SystemStatusSchema).optional().nullable(),
	}),
	type: z.literal('sams_analysis'),
});

/* CREATE SCHEMA */
/* * */
export const SamsAnalysisExportSchema = FileExportBaseSchema.extend(SamsAnalysisExportPropertiesSchema.shape);

/* TYPES */
/* * */
export type SamsAnalysisExportProperties = z.infer<typeof SamsAnalysisExportPropertiesSchema>;
export type FlatSamsAnalysisExportAnalysis = z.infer<typeof FlatSamsAnalysisExportAnalysisSchema>;
export type SamsAnalysisExportData = z.infer<typeof SamsAnalysisExportSchema>;
