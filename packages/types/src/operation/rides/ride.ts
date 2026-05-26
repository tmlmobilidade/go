/* * */

import { DocumentSchema } from '@/_common/document.js';
import { OperationalDateSchema } from '@/_common/operational-date.js';
import { ProcessingStatusSchema } from '@/_common/status.js';
import { UnixTimestampSchema } from '@/_common/unix-timestamp.js';
import { atLeastOneVehicleEventOnFirstStopSchema, endedAtLastStopSchema, expectedApexValidationIntervalSchema, expectedDriverIdQtySchema, expectedStartTimeSchema, expectedVehicleEventDelaySchema, expectedVehicleEventIntervalSchema, expectedVehicleEventQtySchema, expectedVehicleIdQtySchema, matchingApexLocationsSchema, matchingVehicleIdsSchema, simpleOneApexValidationSchema, simpleOneVehicleEventOrApexValidationSchema, simpleThreeVehicleEventsSchema, transactionSequentialitySchema } from '@/operation/rides/ride-analysis.js';
import { z } from 'zod';

/* * */

export const RideSchema = DocumentSchema
	.omit({ is_locked: true })
	.extend({
		agency_id: z.string(),
		analysis: z.object({
			AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP: atLeastOneVehicleEventOnFirstStopSchema,
			ENDED_AT_LAST_STOP: endedAtLastStopSchema,
			EXPECTED_APEX_VALIDATION_INTERVAL: expectedApexValidationIntervalSchema,
			EXPECTED_DRIVER_ID_QTY: expectedDriverIdQtySchema,
			EXPECTED_START_TIME: expectedStartTimeSchema,
			EXPECTED_VEHICLE_EVENT_DELAY: expectedVehicleEventDelaySchema,
			EXPECTED_VEHICLE_EVENT_INTERVAL: expectedVehicleEventIntervalSchema,
			EXPECTED_VEHICLE_EVENT_QTY: expectedVehicleEventQtySchema,
			EXPECTED_VEHICLE_ID_QTY: expectedVehicleIdQtySchema,
			MATCHING_APEX_LOCATIONS: matchingApexLocationsSchema,
			MATCHING_VEHICLE_IDS: matchingVehicleIdsSchema,
			SIMPLE_ONE_APEX_VALIDATION: simpleOneApexValidationSchema,
			SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION: simpleOneVehicleEventOrApexValidationSchema,
			SIMPLE_THREE_VEHICLE_EVENTS: simpleThreeVehicleEventsSchema,
			TRANSACTION_SEQUENTIALITY: transactionSequentialitySchema,
		}).nullable(),
		apex_locations_qty: z.number().nullable(),
		apex_on_board_refunds_amount: z.number().nullable(),
		apex_on_board_refunds_qty: z.number().nullable(),
		apex_on_board_sales_amount: z.number().nullable(),
		apex_on_board_sales_qty: z.number().nullable(),
		apex_validations_qty: z.number().nullable(),
		driver_ids: z.array(z.string()),
		end_time_observed: UnixTimestampSchema.nullable(),
		end_time_scheduled: UnixTimestampSchema,
		extension_observed: z.number().nullable(),
		extension_scheduled: z.number(),
		hashed_pattern_id: z.string(),
		hashed_shape_id: z.string(),
		hashed_trip_id: z.string(),
		headsign: z.string(),
		line_id: z.number(),
		operational_date: OperationalDateSchema,
		passengers_estimated: z.number().nullable(),
		passengers_observed: z.number().nullable(),
		passengers_observed_on_board_sales_amount: z.number().nullable(),
		passengers_observed_on_board_sales_qty: z.number().nullable(),
		passengers_observed_prepaid_amount: z.number().nullable(),
		passengers_observed_prepaid_qty: z.number().nullable(),
		passengers_observed_subscription_qty: z.number().nullable(),
		pattern_id: z.string(),
		plan_id: z.string(),
		route_id: z.string(),
		seen_first_at: UnixTimestampSchema.nullable(),
		seen_last_at: UnixTimestampSchema.nullable(),
		start_time_observed: UnixTimestampSchema.nullable(),
		start_time_scheduled: UnixTimestampSchema,
		system_status: ProcessingStatusSchema.default('waiting'),
		trip_id: z.string(),
		vehicle_ids: z.array(z.number()),
	});

export const CreateRideSchema = RideSchema.partial({ _id: true }).omit({ created_at: true, updated_at: true });
export const UpdateRideSchema = CreateRideSchema.omit({ created_by: true }).partial();

export type Ride = z.infer<typeof RideSchema>;
export type CreateRideDto = z.infer<typeof CreateRideSchema>;
export type UpdateRideDto = z.infer<typeof UpdateRideSchema>;
