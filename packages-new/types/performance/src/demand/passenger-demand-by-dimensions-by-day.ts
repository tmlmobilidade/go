/* * */

import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

/**
 * Reconciled daily passenger-demand fact at the most detailed set of stable
 * dimensions currently available from simplified APEX validations.
 *
 * Missing source dimensions are persisted as the `__unknown__` member so all
 * rows remain additive and consumers do not need nullable grouping semantics.
 */
export const PassengerDemandByDimensionsByDaySchema = z.object({
	accepted_validations_qty: z.number().int().nonnegative(),
	agency_id: z.string(),
	calculated_at: UnixTimestampSchema,
	category: z.string(),
	definition_version: z.literal('passenger-demand-v2'),
	line_id: z.string(),
	operational_date: OperationalDateIntSchema,
	pattern_id: z.string(),
	product_id: z.string(),
	source_watermark: UnixTimestampSchema.nullable(),
});

export type PassengerDemandByDimensionsByDay = z.infer<typeof PassengerDemandByDimensionsByDaySchema>;
