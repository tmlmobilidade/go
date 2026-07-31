/* * */

import { OperationalDateIntSchema, ProcessingStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideSchema = z.object({
	_id: z.string(),
	agency_code: z.string(),
	agency_id: z.string(),
	apex_locations_qty: z.number().nullable().default(null),
	apex_refunds_amount: z.number().nullable().default(null),
	apex_refunds_qty: z.number().nullable().default(null),
	apex_sales_amount: z.number().nullable().default(null),
	apex_sales_qty: z.number().nullable().default(null),
	apex_validations_qty: z.number().nullable().default(null),
	created_at: UnixTimestampSchema,
	direction_id: z.number(),
	driver_ids: z.array(z.string()),
	end_time_observed: UnixTimestampSchema.nullable().default(null),
	end_time_scheduled: UnixTimestampSchema,
	extension_observed: z.number().nullable().default(null),
	extension_scheduled: z.number(),
	hashed_pattern_id: z.string(),
	hashed_shape_id: z.string(),
	hashed_trip_id: z.string(),
	headsign: z.string(),
	line_id: z.string(),
	operational_date: OperationalDateIntSchema,
	passengers_estimated: z.number().nullable(),
	passengers_observed: z.number().nullable(),
	passengers_observed_on_board_sales_qty: z.number().nullable(),
	passengers_observed_prepaid_amount: z.number().nullable(),
	passengers_observed_prepaid_qty: z.number().nullable(),
	passengers_observed_sales_amount: z.number().nullable(),
	passengers_observed_subscription_qty: z.number().nullable(),
	pattern_id: z.string(),
	plan_id: z.string(),
	processing_status: ProcessingStatusSchema.default('waiting'),
	route_id: z.string(),
	seen_first_at: UnixTimestampSchema.nullable().default(null),
	seen_last_at: UnixTimestampSchema.nullable().default(null),
	start_time_observed: UnixTimestampSchema.nullable().default(null),
	start_time_scheduled: UnixTimestampSchema,
	trip_id: z.string(),
	updated_at: UnixTimestampSchema,
	vehicle_ids: z.array(z.string()),
});

/**
 * A Ride represents a single vehicle journey on a single route for a single day.
 * It is the basic unit of analysis for the public transit system.
 */
export type Ride = z.infer<typeof RideSchema>;
