/* * */

import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

/**
 * Latest completed-minute demand projection derived from the reconciled
 * minute fact. Replacing this row does not create publication-time history.
 */
export const PassengerDemandRealtimeSchema = z.object({
	agency_id: z.string(),
	calculated_at: UnixTimestampSchema,
	current_cutoff: UnixTimestampSchema,
	current_operational_date: OperationalDateIntSchema,
	definition_version: z.literal('passenger-demand-v2'),
	last_week_cutoff: UnixTimestampSchema,
	last_week_operational_date: OperationalDateIntSchema,
	passenger_validations_qty_last_week: z.number().int().nonnegative(),
	passenger_validations_qty_now: z.number().int().nonnegative(),
	source_watermark: UnixTimestampSchema.nullable(),
});

export type PassengerDemandRealtime = z.infer<typeof PassengerDemandRealtimeSchema>;
