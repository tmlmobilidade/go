/* * */

import { AlertReferenceSchema } from '@/alerts/reference.js';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { FileExportBaseSchema } from './base.js';

/* * */
/* DATA SCHEMA */
export const FlatAlertSchema = z.object({
	/* GENERAL */
	/* * */
	_id: z.string().nullable(),
	agency_id: z.string().nullable(),
	auto_texts: z.boolean().nullable(),
	cause: z.string().nullable(),
	coordinates: z.tuple([z.number(), z.number()]).nullable().default(null),
	description: z.string().nullable(),
	effect: z.string().nullable(),
	external_id: z.string().nullable(),
	file_id: z.string().nullable(),
	info_url: z.union([z.string().url(), z.literal('')]).nullable().default(null),
	is_locked: z.boolean().default(false),
	municipality_ids: z.array(z.string()).default([]),
	title: z.string().nullable(),
	user_instructions: z.string().nullable().default(''),

	/* PUBLISH */
	/* * */
	publish_end_date: UnixTimestampSchema.nullable().default(null),
	publish_start_date: UnixTimestampSchema.nullable().default(null),
	publish_status: z.string().nullable(),

	/* REFERENCE */
	/* * */
	reference_type: z.string().nullable(),
	references: z.array(AlertReferenceSchema).default([]),

	/* DATES */
	/* * */
	active_period_end_date: UnixTimestampSchema.nullable().default(null),
	active_period_start_date: UnixTimestampSchema,
	/* CREATION AND UPDATE */
	/* * */
	created_at: UnixTimestampSchema,
	created_by: z.string().nullable().default(null),
	updated_at: UnixTimestampSchema,
	updated_by: z.string().optional(),
});
/* PROPERTIES SCHEMA */
/* * */
export const AlertExportPropertiesSchema = z.object({
	properties: z.object({

		active_period_start_date: z.string().optional().nullable(),
		agency_ids: z.array(z.string()).optional().nullable(),

		alert_ids: z.array(z.string()),
		cause: z.array(z.string()).optional().nullable(),
		effect: z.array(z.string()).optional().nullable(),

		end_date: z.string().optional().nullable(),

		municipality_ids: z.array(z.string()).optional().nullable(),
		publish_status: z.array(z.string()).optional().nullable(),

		search: z.string().optional().nullable(),
	}),
	type: z.literal('alert'),
});
/* CREATE SCHEMA */
/* * */
export const AlertExportSchema = FileExportBaseSchema.extend(AlertExportPropertiesSchema.shape);

/* TYPES */
/* * */
export type AlertExportProperties = z.infer<typeof AlertExportPropertiesSchema>;
export type AlertExportData = z.infer<typeof FlatAlertSchema>;
