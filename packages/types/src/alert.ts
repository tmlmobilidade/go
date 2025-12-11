/* * */

import { DocumentSchema } from '@/_common/document.js';
import { PublishStatusSchema } from '@/_common/status.js';
import { unixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { gtfsCauseSchema, gtfsEffectSchema } from '@/gtfs/cause-effetcs.js';
import { z } from 'zod';

/* * */

// Define constants for enum values for better maintainability
export const AlertTypeSchema = z.enum(['PLANNED', 'REALTIME']);
export const ReferenceTypeSchema = z.enum(['LINE', 'STOP', 'AGENCY', 'TRIP']);

export type AlertType = z.infer<typeof AlertTypeSchema>;
export type ReferenceType = z.infer<typeof ReferenceTypeSchema>;

/* * */

// Base schema for alerts with common validation rules
export const AlertSchema = DocumentSchema.extend({
	active_period_end_date: unixTimeStampSchema.nullable().default(null),
	active_period_start_date: unixTimeStampSchema,
	cause: gtfsCauseSchema,
	coordinates: z.tuple([z.number(), z.number()]).nullable().default(null),
	created_by: z.string().nullable(),
	description: z.string(),
	effect: gtfsEffectSchema,
	external_id: z.string().nullable().default(null),
	file_id: z.string().nullable().default(null),
	info_url: z.string().url().nullable().default(null),
	municipality_ids: z.array(z.string().min(1)).default([]),
	publish_end_date: unixTimeStampSchema.nullable().default(Date.now()),
	publish_start_date: unixTimeStampSchema.nullable().default(Date.now()),
	publish_status: PublishStatusSchema.default('DRAFT'),
	reference_type: ReferenceTypeSchema.nullable().default(ReferenceTypeSchema.options[0]),
	references: z.array(z.object({
		child_ids: z.array(z.string().min(1)),
		parent_id: z.string().min(1),
	})).default([]),
	title: z.string().min(1),
	type: AlertTypeSchema.nullable().default(AlertTypeSchema.options[0]),
});

export const CreateAlertSchema = AlertSchema.omit({ _id: true, created_at: true, created_by: true, updated_at: true, updated_by: true });
export const UpdateAlertSchema = CreateAlertSchema.partial();

// Define the Alert interface
export type Alert = z.infer<typeof AlertSchema>;
export type CreateAlertDto = z.infer<typeof CreateAlertSchema>;
export type UpdateAlertDto = z.infer<typeof UpdateAlertSchema>;

/* * */

export const GetAllAlertsQuerySchema = z.object({
	realtime: z.preprocess(
		(val: string) => val === 'true' || val === '1',
		z.boolean(),
	),
});

export type GetAllAlertsQuery = z.infer<typeof GetAllAlertsQuerySchema>;

/* * */
