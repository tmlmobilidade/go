/* * */

import { RideAcceptanceStatusSchema } from '@/ride-acceptances/acceptance-status.js';
import { RideSchema } from '@/rides/ride.js';
import { DelayStatusSchema, GradeStatusSchema, OperationalStatusSchema, SeenStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideViewSchema = RideSchema.extend({
	acceptance_status: z.enum([...RideAcceptanceStatusSchema.options, 'none']),
	analysis_at_least_one_vehicle_event_on_last_stop_grade: z.enum([...GradeStatusSchema.options, 'none']),
	analysis_expected_apex_validation_interval_grade: z.enum([...GradeStatusSchema.options, 'none']),
	analysis_simple_three_vehicle_events_grade: z.enum([...GradeStatusSchema.options, 'none']),
	analysis_transaction_sequentiality_grades: z.enum([...GradeStatusSchema.options, 'none']),
	end_delay_status: z.enum([...DelayStatusSchema.options, 'none']),
	end_delay_value_display: z.string().nullable(),
	end_time_observed_display: z.string().nullable(),
	end_time_scheduled_display: z.string(),
	operational_status: OperationalStatusSchema,
	seen_status: SeenStatusSchema,
	start_delay_status: z.enum([...DelayStatusSchema.options, 'none']),
});

/**
 * Use this schema for displaying rides in the frontend.
 * This glues the ride schema with the ride acceptance schema
 * and the main ride analysis schemas to create a single object,
 * easier to work with in the frontend.
 */
export type RideView = z.infer<typeof RideViewSchema>;
