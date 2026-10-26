/* * */

import { AlertSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const OperationAlertsV1OutputRowSchema = AlertSchema.pick({
	_id: true,
	agency_id: true,
	cause: true,
	created_by: true,
	description: true,
	effect: true,
	publish_status: true,
	reference_type: true,
	title: true,
}).extend({
	active_period_end_date: z.string(),
	active_period_start_date: z.string().datetime(),
	coordinates: z.string(),
	created_at: z.string().datetime(),
	external_id: z.string(),
	file_id: z.string(),
	info_url: z.string(),
	lines: z.string(),
	municipality_ids: z.string(),
	publish_end_date: z.string(),
	publish_start_date: z.string(),
	stops: z.string(),
	updated_at: z.string().datetime(),
	updated_by: z.string(),
});

export type OperationAlertsV1OutputRow = z.infer<typeof OperationAlertsV1OutputRowSchema>;
