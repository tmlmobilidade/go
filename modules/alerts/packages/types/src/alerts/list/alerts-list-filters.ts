/* * */

import { AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
import { PublishStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsListFiltersSchema = z.object({

	agency_ids: z
		.array(z.string())
		.default([]),

	publish_end_date_end: UnixTimestampSchema
		.optional(),

	publish_end_date_start: UnixTimestampSchema
		.optional(),

	publish_start_date_end: UnixTimestampSchema
		.optional(),

	publish_start_date_start: UnixTimestampSchema
		.optional(),

	publish_status: z
		.array(PublishStatusSchema)
		.optional(),

	reference_type: z
		.array(AlertReferenceTypeSchema)
		.optional(),

	search: z
		.string()
		.optional(),

});

/**
 * The filters schema for getting alerts.
 * It is intended for use in the alerts module.
 */
export type AlertsListFilters = z.infer<typeof AlertsListFiltersSchema>;
