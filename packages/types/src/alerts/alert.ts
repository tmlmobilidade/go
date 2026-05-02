/* * */

import { DocumentSchema } from '@/_common/document.js';
import { PublishStatusSchema } from '@/_common/status.js';
import { UnixTimestampSchema } from '@/_common/unix-timestamp.js';
import { AlertCauseSchema } from '@/alerts/cause.js';
import { AlertEffectSchema } from '@/alerts/effect.js';
import { AlertReferenceTypeSchema } from '@/alerts/reference-type.js';
import { z } from 'zod';

/* * */

export const AlertSchema = DocumentSchema.extend({
	active_period_end_date: UnixTimestampSchema.nullable().default(null),
	active_period_start_date: UnixTimestampSchema,
	agency_id: z.string(),
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
	references: z.array(z.object({
		child_ids: z.array(z.string()),
		parent_id: z.string(),
	})).default([]),
	title: z.string(),
});

export const CreateAlertSchema = AlertSchema.omit({ _id: true, created_at: true, created_by: true, updated_at: true, updated_by: true });
export const UpdateAlertSchema = CreateAlertSchema.partial();

export type Alert = z.infer<typeof AlertSchema>;
export type CreateAlertDto = z.infer<typeof CreateAlertSchema>;
export type UpdateAlertDto = z.infer<typeof UpdateAlertSchema>;
