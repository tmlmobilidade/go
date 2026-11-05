/* * */

import { AlertCauseSchema, AlertEffectSchema, AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
import { PublishStatusSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

/**
 * The properties of a v1 Alerts extraction.
 * They mirror the active Alerts list filters, including the search query.
 */
export const OperationAlertsV1ExtractionPropertiesSchema = z.object({

	active_period_filter_end: UnixMillisecondsSchema
		.optional(),

	active_period_filter_start: UnixMillisecondsSchema
		.optional(),

	agency_ids: z
		.array(z.string())
		.min(1),

	causes: z
		.array(AlertCauseSchema)
		.min(1),

	effects: z
		.array(AlertEffectSchema)
		.min(1),

	publish_date_filter_end: UnixMillisecondsSchema,

	publish_date_filter_start: UnixMillisecondsSchema,

	publish_status: z
		.array(PublishStatusSchema)
		.min(1),

	reference_type: z
		.array(AlertReferenceTypeSchema)
		.min(1),

	search: z
		.string()
		.optional(),

})
	.refine(properties => properties.publish_date_filter_start <= properties.publish_date_filter_end, {
		message: 'The publication end date must be on or after the start date',
		path: ['publish_date_filter_end'],
	})
	.refine((properties) => {
		if (properties.active_period_filter_start === undefined || properties.active_period_filter_end === undefined) return true;
		return properties.active_period_filter_start <= properties.active_period_filter_end;
	}, {
		message: 'The active period end date must be on or after the start date',
		path: ['active_period_filter_end'],
	});

export type OperationAlertsV1ExtractionProperties = z.infer<typeof OperationAlertsV1ExtractionPropertiesSchema>;
