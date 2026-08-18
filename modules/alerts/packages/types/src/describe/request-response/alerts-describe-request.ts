/* * */

import { AlertCauseSchema, AlertEffectSchema, AlertReferenceSchema, AlertReferenceTypeSchema } from '@tmlmobilidade/go-types-operation';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsDescribeRequestSchema = z.object({
	active_period_end_date: UnixTimestampSchema,
	active_period_start_date: UnixTimestampSchema,
	agency_id: z.string(),
	cause: AlertCauseSchema,
	effect: AlertEffectSchema,
	reference_type: AlertReferenceTypeSchema,
	references: z.array(AlertReferenceSchema),
	user_instructions: z.string().nullable().default(null),
});

/**
 * A request model for describing an alert.
 */
export type AlertsDescribeRequest = z.infer<typeof AlertsDescribeRequestSchema>;
