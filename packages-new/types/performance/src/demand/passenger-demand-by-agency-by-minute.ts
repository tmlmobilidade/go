/* * */

import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

/**
 * Reconciled event-time passenger demand at the smallest persisted metric
 * grain. Ratios, cumulative values, and selected-agency totals are derived by
 * consumers.
 */
export const PassengerDemandByAgencyByMinuteSchema = z.object({
	accepted_validations_qty: z.number().int().nonnegative(),
	agency_id: z.string(),
	calculated_at: UnixTimestampSchema,
	definition_version: z.literal('passenger-demand-v2'),
	interval_start: UnixTimestampSchema,
	operational_date: OperationalDateIntSchema,
	source_watermark: UnixTimestampSchema.nullable(),
});

export type PassengerDemandByAgencyByMinute = z.infer<typeof PassengerDemandByAgencyByMinuteSchema>;
