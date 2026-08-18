/* * */

import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const PassengerDemandDataStatusSchema = z.enum(['provisional', 'reconciled']);

/**
 * Five-minute passenger-demand fact at the operational dimensions required by
 * Performance V2. Product and category remain available in the daily fact.
 *
 * Missing source dimensions are persisted as the `__unknown__` member so the
 * fact remains additive and consumers do not need nullable grouping semantics.
 */
export const PassengerDemandByDimensionsBy5MinutesSchema = z.object({
	accepted_validations_qty: z.number().int().nonnegative(),
	agency_id: z.string(),
	calculated_at: UnixTimestampSchema,
	data_status: PassengerDemandDataStatusSchema,
	definition_version: z.literal('passenger-demand-v2'),
	interval_start: UnixTimestampSchema,
	line_id: z.string(),
	operational_date: OperationalDateIntSchema,
	pattern_id: z.string(),
	source_watermark: UnixTimestampSchema.nullable(),
	stop_id: z.string(),
});

export type PassengerDemandByDimensionsBy5Minutes = z.infer<typeof PassengerDemandByDimensionsBy5MinutesSchema>;
export type PassengerDemandDataStatus = z.infer<typeof PassengerDemandDataStatusSchema>;
