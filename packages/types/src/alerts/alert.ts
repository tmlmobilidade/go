/* * */

import { AlertCauseSchema } from '@/alerts/cause.js';
import { AlertEffectSchema } from '@/alerts/effect.js';
import { AlertReferenceTypeSchema } from '@/alerts/reference-type.js';
import { AlertReferenceSchema } from '@/alerts/reference.js';
import { DocumentSchema, PublishStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertSchema = DocumentSchema.extend({
	active_period_end_date: UnixTimestampSchema.nullable().default(null),
	active_period_start_date: UnixTimestampSchema,
	agency_id: z.string(),
	auto_texts: z.boolean().default(true),
	cause: AlertCauseSchema,
	coordinates: z.tuple([z.number(), z.number()]).nullable().default(null),
	description: z.string(),
	effect: AlertEffectSchema,
	external_id: z.string().nullable().default(null),
	file_id: z.string().nullable().default(null),
	info_url: z.union([z.string().url(), z.literal('')]).nullable().default(null),
	municipality_ids: z.array(z.string()).default([]),
	publish_end_date: UnixTimestampSchema.nullable().default(null),
	publish_start_date: UnixTimestampSchema.nullable().default(null),
	publish_status: PublishStatusSchema.default('draft'),
	reference_type: AlertReferenceTypeSchema,
	references: z.array(AlertReferenceSchema).default([]),
	title: z.string(),
	user_instructions: z.string().default(''),
});

export const CreateAlertSchema = AlertSchema.omit({ _id: true, created_at: true, created_by: true, updated_at: true, updated_by: true });
export const UpdateAlertSchema = CreateAlertSchema.partial();

export type Alert = z.infer<typeof AlertSchema>;
export type CreateAlertDto = z.infer<typeof CreateAlertSchema>;
export type UpdateAlertDto = z.infer<typeof UpdateAlertSchema>;
