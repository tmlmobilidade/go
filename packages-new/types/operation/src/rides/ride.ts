/* * */

import { EncodedPolylineSchema } from '@tmlmobilidade/go-types-geo';
import { GtfsTripDirectionSchema } from '@tmlmobilidade/go-types-gtfs';
import { HexColorSchema, NonNegativeNumberSchema, OperationalDateIntSchema, ProcessingStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

const RideIdentitySchema = z.object({
	_id: z.string(),
	agency_code: z.string(),
	agency_id: z.string(),
	direction_id: GtfsTripDirectionSchema,
	hashed_trip_id: z.string(),
	headsign: z.string(),
	operational_date: OperationalDateIntSchema,
	plan_id: z.string(),
	route_color: HexColorSchema.default('#000000'),
	route_id: z.string(),
	route_long_name: z.string(),
	route_short_name: z.string(),
	route_text_color: HexColorSchema.default('#FFFFFF'),
	shape_id: z.string(),
	shape_polyline: EncodedPolylineSchema,
	trip_id: z.string(),
});

const RideScheduleSchema = z.object({
	end_time_observed: UnixTimestampSchema.nullable().default(null),
	end_time_scheduled: UnixTimestampSchema,
	extension_observed: NonNegativeNumberSchema.nullable().default(null),
	extension_scheduled: NonNegativeNumberSchema,
	start_time_observed: UnixTimestampSchema.nullable().default(null),
	start_time_scheduled: UnixTimestampSchema,
});

const RideApexSchema = z.object({
	apex_banking_taps_amount: NonNegativeNumberSchema.nullable().default(null),
	apex_banking_taps_qty: NonNegativeNumberSchema.nullable().default(null),
	apex_locations_qty: NonNegativeNumberSchema.nullable().default(null),
	apex_refunds_amount: NonNegativeNumberSchema.nullable().default(null),
	apex_refunds_qty: NonNegativeNumberSchema.nullable().default(null),
	apex_sales_amount: NonNegativeNumberSchema.nullable().default(null),
	apex_sales_qty: NonNegativeNumberSchema.nullable().default(null),
	apex_validations_qty: NonNegativeNumberSchema.nullable().default(null),
});

const RidePassengersSchema = z.object({
	passengers_estimated: NonNegativeNumberSchema.nullable().default(null),
	passengers_observed: NonNegativeNumberSchema.nullable().default(null),
	passengers_observed_banking_taps_amount: NonNegativeNumberSchema.nullable().default(null),
	passengers_observed_banking_taps_qty: NonNegativeNumberSchema.nullable().default(null),
	passengers_observed_prepaid_amount: NonNegativeNumberSchema.nullable().default(null),
	passengers_observed_prepaid_qty: NonNegativeNumberSchema.nullable().default(null),
	passengers_observed_sales_amount: NonNegativeNumberSchema.nullable().default(null),
	passengers_observed_sales_qty: NonNegativeNumberSchema.nullable().default(null),
	passengers_observed_subscription_qty: NonNegativeNumberSchema.nullable().default(null),
});

const RideOperationSchema = z.object({
	driver_ids: z.array(z.string()).default([]),
	seen_first_at: UnixTimestampSchema.nullable().default(null),
	seen_last_at: UnixTimestampSchema.nullable().default(null),
	vehicle_ids: z.array(z.string()).default([]),
});

const RideLifecycleSchema = z.object({
	processing_status: ProcessingStatusSchema.default('waiting'),
	updated_at: UnixTimestampSchema,
});

/* * */

export const RideSchema = RideIdentitySchema
	.merge(RideScheduleSchema)
	.merge(RideApexSchema)
	.merge(RidePassengersSchema)
	.merge(RideOperationSchema)
	.merge(RideLifecycleSchema);

/**
 * A Ride represents a single vehicle journey on a single route for a single day.
 * It is the basic unit of analysis for the public transit system.
 */
export type Ride = z.infer<typeof RideSchema>;
