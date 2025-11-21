/* * */

import { DocumentSchema } from '@/_common/document.js';
import { operationalDateSchema } from '@/_common/operational-date.js';
import { DelayStatusSchema, OperationalStatusSchema, ProcessingStatusSchema, SeenStatusSchema } from '@/_common/status.js';
import { unixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { RideAcceptanceStatusSchema } from '@/rides/ride-acceptance.js';
import { atLeastOneVehicleEventOnFirstStopSchema, endedAtLastStopSchema, expectedApexValidationIntervalSchema, expectedDriverIdQtySchema, expectedStartTimeSchema, expectedVehicleEventDelaySchema, expectedVehicleEventIntervalSchema, expectedVehicleEventQtySchema, expectedVehicleIdQtySchema, matchingApexLocationsSchema, matchingVehicleIdsSchema, RideAnalysis, simpleOneApexValidationSchema, simpleOneVehicleEventOrApexValidationSchema, simpleThreeVehicleEventsSchema, transactionSequentialitySchema } from '@/rides/ride-analysis.js';
import { z } from 'zod';

/* * */

export const RideSchema = DocumentSchema.extend({
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
	end_time_observed: unixTimeStampSchema.nullable(),
	end_time_scheduled: unixTimeStampSchema,
	extension_observed: z.number().nullable(),
	extension_scheduled: z.number(),
	hashed_shape_id: z.string(),
	hashed_trip_id: z.string(),
	headsign: z.string(),
	line_id: z.number(),
	operational_date: operationalDateSchema,
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
	seen_first_at: unixTimeStampSchema.nullable(),
	seen_last_at: unixTimeStampSchema.nullable(),
	start_time_observed: unixTimeStampSchema.nullable(),
	start_time_scheduled: unixTimeStampSchema,
	system_status: ProcessingStatusSchema.default('waiting'),
	trip_id: z.string(),
	vehicle_ids: z.array(z.number()),
});

export const CreateRideSchema = RideSchema.partial({ _id: true }).omit({ created_at: true, updated_at: true });
export const UpdateRideSchema = CreateRideSchema.omit({ created_by: true }).partial();

export type Ride = z.infer<typeof RideSchema>;
export type CreateRideDto = z.infer<typeof CreateRideSchema>;
export type UpdateRideDto = z.infer<typeof UpdateRideSchema>;

/* * */

export interface RideNormalized extends Ride {
	acceptance_status: typeof RideAcceptanceStatusSchema.options[number]
	analysis_ended_at_last_stop_grade: 'none' | RideAnalysis['grade']
	analysis_expected_apex_validation_interval: 'none' | RideAnalysis['grade']
	analysis_simple_three_vehicle_events_grade: 'none' | RideAnalysis['grade']
	analysis_transaction_sequentiality: 'none' | RideAnalysis['grade']

	/**
	 * @deprecated use `start_time_observed_display` instead
	 */
	delay_status: typeof DelayStatusSchema.options[number]

	/**
	 * @deprecated use `start_time_observed_display` instead
	 */
	delay_value_display: null | string

	end_delay_status: typeof DelayStatusSchema.options[number]
	end_delay_value_display: null | string
	end_time_observed_display: null | string
	end_time_scheduled_display: string
	operational_status: typeof OperationalStatusSchema.options[number]
	seen_status: typeof SeenStatusSchema.options[number]
	start_delay_status: typeof DelayStatusSchema.options[number]
	start_delay_value_display: null | string
	start_time_observed_display: null | string
	start_time_scheduled_display: string
}

/* * */

export const RidePermissionSchema = z.object({
	agency_ids: z.array(z.string()),
});

export type RidePermission = z.infer<typeof RidePermissionSchema>;
