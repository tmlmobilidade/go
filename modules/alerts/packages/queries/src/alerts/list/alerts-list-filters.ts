/* * */

import { AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
import { PublishStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { toQueryParamsSchema } from '@tmlmobilidade/utils';
import { z } from 'zod';

/* * */

const alertsListFiltersShape = {

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
		.union([PublishStatusSchema, z.literal('all')])
		.default('all'),

	reference_type: z
		.union([AlertReferenceTypeSchema, z.literal('all')])
		.default('all'),

	search: z
		.string()
		.optional(),

} as const;

export const AlertsListFiltersSchema = z.object(alertsListFiltersShape);

export const AlertsListFiltersQuerySchema = toQueryParamsSchema(alertsListFiltersShape, {
	agency_ids: 'array',
	publish_end_date_end: 'optional',
	publish_end_date_start: 'optional',
	publish_start_date_end: 'optional',
	publish_start_date_start: 'optional',
	search: 'optional',
});

/**
 * The filters schema for getting alerts.
 * It is intended for use in the alerts module.
 */
export type AlertsListFilters = z.infer<typeof AlertsListFiltersSchema>;
