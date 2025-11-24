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
	active_period_end_date: unixTimeStampSchema.nullish(),
	active_period_start_date: unixTimeStampSchema,
	cause: gtfsCauseSchema,
	coordinates: z.tuple([z.number(), z.number()]).nullish(),
	created_by: z.string().min(1),
	description: z.string(),
	effect: gtfsEffectSchema,
	external_id: z.string().nullish(),
	file_id: z.string().nullish(),
	info_url: z.string().url().optional().or(z.literal('')),
	modified_by: z.string().min(1),
	municipality_ids: z.array(z.string().min(1)),
	publish_end_date: unixTimeStampSchema.nullish(),
	publish_start_date: unixTimeStampSchema,
	publish_status: PublishStatusSchema,
	reference_type: ReferenceTypeSchema,
	references: z.array(z.object({
		child_ids: z.array(z.string().min(1)),
		parent_id: z.string().min(1),
	})),
	title: z.string().min(1),
	type: AlertTypeSchema,
}).strict();

export const CreateAlertSchema = AlertSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateAlertSchema = CreateAlertSchema.omit({ created_by: true }).partial();

// Define the Alert interface
export type Alert = z.infer<typeof AlertSchema>;
export type CreateAlertDto = z.infer<typeof CreateAlertSchema>;
export type UpdateAlertDto = z.infer<typeof UpdateAlertSchema>;

/* * */

export const AlertPermissionSchema = z.object({
	agency_ids: z.array(z.string()),
});

export type AlertPermission = z.infer<typeof AlertPermissionSchema>;

/* * */

export const GetAllAlertsQuerySchema = z.object({
	realtime: z.preprocess(
		(val: string) => val === 'true' || val === '1',
		z.boolean(),
	),
});

export type GetAllAlertsQuery = z.infer<typeof GetAllAlertsQuerySchema>;

/* * */
