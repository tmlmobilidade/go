/* * */

import { RideAcceptanceStatusSchema } from '@/ride-acceptances/acceptance-status.js';
import { RideSchema } from '@/rides/ride.js';
import { DelayStatusSchema, GradeStatusSchema, OperationalStatusSchema, SeenStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideViewSchema = RideSchema.extend({
	acceptance_status: RideAcceptanceStatusSchema.nullable().default(null),
	analysis_at_least_one_vehicle_event_on_last_stop_grade: GradeStatusSchema.nullable().default(null),
	analysis_expected_apex_validation_interval_grade: GradeStatusSchema.nullable().default(null),
	analysis_simple_three_vehicle_events_grade: GradeStatusSchema.nullable().default(null),
	analysis_transaction_sequentiality_grade: GradeStatusSchema.nullable().default(null),
	end_delay_status: DelayStatusSchema.nullable().default(null),
	operational_status: OperationalStatusSchema,
	seen_status: SeenStatusSchema,
	start_delay_status: DelayStatusSchema.nullable().default(null),
});

/**
 * A read model combining the canonical ride data with derived
 * operational state, acceptance state, delay state, and analysis results.
 * This is the shape returned by ride queries and is intended for
 * read-only consumption by the API/frontend.
 */
export type RideView = z.infer<typeof RideViewSchema>;
