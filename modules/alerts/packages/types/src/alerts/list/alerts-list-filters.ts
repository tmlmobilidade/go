/* * */

import { AlertCauseSchema, AlertEffectSchema, AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
import { PublishStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsListFiltersSchema = z.object({

	active_period_end: UnixTimestampSchema
		.optional(),

	active_period_start: UnixTimestampSchema
		.optional(),

	agency_ids: z
		.array(z.string())
		.default([]),

	causes: z
		.array(AlertCauseSchema)
		.default([]),

	effects: z
		.array(AlertEffectSchema)
		.default([]),

	publish_date_end: UnixTimestampSchema
		.optional(),

	publish_date_start: UnixTimestampSchema
		.optional(),

	publish_status: z
		.array(PublishStatusSchema)
		.default([]),

	reference_type: z
		.array(AlertReferenceTypeSchema)
		.default([]),

	search: z
		.string()
		.optional(),

});

/**
 * The filters schema for getting alerts.
 * It is intended for use in the alerts module.
 */
export type AlertsListFilters = z.infer<typeof AlertsListFiltersSchema>;
