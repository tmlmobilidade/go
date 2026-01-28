/* * */

import { DelayStatusSchema, OperationalStatusSchema, SeenStatusSchema } from '@/_common/status.js';
import { RideAcceptanceStatusSchema } from '@/rides/ride-acceptance.js';
import { RideAnalysisGradeSchema } from '@/rides/ride-analysis.js';
import { RideSchema } from '@/rides/ride.js';
import { z } from 'zod';

/* * */

export const RideNormalizedSchema = RideSchema.extend({
	acceptance_status: RideAcceptanceStatusSchema,
	analysis_ended_at_last_stop_grade: RideAnalysisGradeSchema.or(z.literal('none')),
	analysis_expected_apex_validation_interval: RideAnalysisGradeSchema.or(z.literal('none')),
	analysis_simple_three_vehicle_events_grade: RideAnalysisGradeSchema.or(z.literal('none')),
	analysis_transaction_sequentiality: RideAnalysisGradeSchema.or(z.literal('none')),

	/**
	 * @deprecated use `start_time_observed_display` instead
	 */
	delay_status: DelayStatusSchema,

	/**
	 * @deprecated use `start_time_observed_display` instead
	 */
	delay_value_display: z.string().nullable(),

	end_delay_status: DelayStatusSchema,
	end_delay_value_display: z.string().nullable(),
	end_time_observed_display: z.string().nullable(),
	end_time_scheduled_display: z.string(),
	operational_status: OperationalStatusSchema,
	seen_status: SeenStatusSchema,
	start_delay_status: DelayStatusSchema,
	start_delay_value_display: z.string().nullable(),
	start_time_observed_display: z.string().nullable(),
	start_time_scheduled_display: z.string(),
});

/* * */

export type RideNormalized = z.infer<typeof RideNormalizedSchema>;
