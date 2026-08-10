/* * */

import { RideAcceptanceStatusSchema } from '@/ride-acceptances/acceptance-status.js';
import { DelayStatusSchema, GradeStatusSchema, OperationalStatusSchema, SeenStatusSchema, TicketingStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GetRidesQuerySchema = z.object({

	acceptance_statuses: z
		.array(RideAcceptanceStatusSchema)
		.optional(),

	agency_ids: z
		.array(z.string())
		.default([]),

	analysis_at_least_one_vehicle_event_on_last_stop_grades: z
		.array(GradeStatusSchema.nullable())
		.optional(),

	analysis_expected_apex_validation_interval_grades: z
		.array(GradeStatusSchema.nullable())
		.optional(),

	analysis_simple_three_vehicle_events_grades: z
		.array(GradeStatusSchema.nullable())
		.optional(),

	analysis_transaction_sequentiality_grades: z
		.array(GradeStatusSchema.nullable())
		.optional(),

	delay_statuses: z
		.array(DelayStatusSchema.nullable())
		.optional(),

	driver_ids: z
		.array(z.string())
		.optional(),

	operational_statuses: z
		.array(OperationalStatusSchema)
		.optional(),

	route_short_names: z
		.array(z.string())
		.optional(),

	search: z
		.string()
		.optional(),

	seen_statuses: z
		.array(SeenStatusSchema)
		.optional(),

	start_time_scheduled_end: UnixTimestampSchema,

	start_time_scheduled_start: UnixTimestampSchema,

	stop_ids: z
		.array(z.string())
		.optional(),

	ticketing_statuses: z
		.array(TicketingStatusSchema)
		.optional(),

	vehicle_ids: z
		.array(z.string())
		.optional(),

});

/**
 * The query schema for getting rides.
 */
export type GetRidesQuery = z.infer<typeof GetRidesQuerySchema>;
