/* * */

import { RideAcceptanceStatusSchema } from '@/operation/rides/ride-acceptance.js';
import { RideAnalysisGradeSchema } from '@/operation/rides/ride-analysis.js';
import { RideSchema } from '@/operation/rides/ride.js';
import { DelayStatusSchema, OperationalStatusSchema, SeenStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideNormalizedSchema = RideSchema.extend({
	acceptance_status: z.enum([...RideAcceptanceStatusSchema.options, 'none']),
	analysis_ended_at_last_stop_grade: z.enum([...RideAnalysisGradeSchema.options, 'none']),
	analysis_expected_apex_validation_interval: z.enum([...RideAnalysisGradeSchema.options, 'none']),
	analysis_simple_three_vehicle_events_grade: z.enum([...RideAnalysisGradeSchema.options, 'none']),
	analysis_transaction_sequentiality: z.enum([...RideAnalysisGradeSchema.options, 'none']),

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
