/* * */

import { RideAcceptanceStatusSchema } from '@tmlmobilidade/go-types-operation';
import { DelayStatusSchema, GradeStatusSchema, OperationalStatusSchema, TicketingStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const ControllerRidesListFiltersSchema = z.object({

	acceptance_statuses: z
		.array(z.union([RideAcceptanceStatusSchema, z.literal('none')]))
		.optional(),

	agency_ids: z
		.array(z.string())
		.default([]),

	analysis_at_least_one_vehicle_event_on_last_stop_grades: z
		.array(z.union([GradeStatusSchema, z.literal('none')]))
		.optional(),

	analysis_expected_apex_validation_interval_grades: z
		.array(z.union([GradeStatusSchema, z.literal('none')]))
		.optional(),

	analysis_simple_three_vehicle_events_grades: z
		.array(z.union([GradeStatusSchema, z.literal('none')]))
		.optional(),

	analysis_transaction_sequentiality_grades: z
		.array(z.union([GradeStatusSchema, z.literal('none')]))
		.optional(),

	driver_ids: z
		.string()
		.optional(),

	end_delay_statuses: z
		.array(z.union([DelayStatusSchema, z.literal('none')]))
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

	start_delay_statuses: z
		.array(z.union([DelayStatusSchema, z.literal('none')]))
		.optional(),

	start_time_scheduled_end: UnixTimestampSchema,

	start_time_scheduled_start: UnixTimestampSchema,

	ticketing_statuses: z
		.array(TicketingStatusSchema)
		.optional(),

	vehicle_ids: z
		.string()
		.optional(),

});

/**
 * The filters schema for getting rides.
 * It is intended for use in the controller module.
 */
export type ControllerRidesListFilters = z.infer<typeof ControllerRidesListFiltersSchema>;
