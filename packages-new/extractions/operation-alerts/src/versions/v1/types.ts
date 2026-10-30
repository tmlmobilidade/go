/* * */

import { AlertSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

/** Invalid or missing field values leave their CSV cell empty without discarding the alert. */
export const OperationAlertsV1OutputRowSchema = z.object({
	_id: AlertSchema.shape._id.catch(''),
	active_period_end_date: z.string().datetime().catch(''),
	active_period_start_date: z.string().datetime().catch(''),
	agency_id: AlertSchema.shape.agency_id.catch(''),
	cause: AlertSchema.shape.cause.or(z.literal('')).catch(''),
	coordinates: z.string().catch(''),
	created_at: z.string().datetime().catch(''),
	created_by: AlertSchema.shape.created_by.catch(''),
	description: AlertSchema.shape.description.catch(''),
	effect: AlertSchema.shape.effect.or(z.literal('')).catch(''),
	external_id: z.string().catch(''),
	file_id: z.string().catch(''),
	info_url: z.string().url().or(z.literal('')).catch(''),
	lines: z.string().catch(''),
	municipality_ids: z.string().catch(''),
	publish_end_date: z.string().datetime().catch(''),
	publish_start_date: z.string().datetime().catch(''),
	publish_status: AlertSchema.shape.publish_status.removeDefault().or(z.literal('')).catch(''),
	reference_type: AlertSchema.shape.reference_type.or(z.literal('')).catch(''),
	stops: z.string().catch(''),
	title: AlertSchema.shape.title.catch(''),
	updated_at: z.string().datetime().catch(''),
	updated_by: z.string().catch(''),
});

export type OperationAlertsV1OutputRowInput = z.input<typeof OperationAlertsV1OutputRowSchema>;
export type OperationAlertsV1OutputRow = z.infer<typeof OperationAlertsV1OutputRowSchema>;
