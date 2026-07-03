/* * */

import { AlertCauseSchema } from '@/alerts/cause.js';
import { FileExportBaseSchema } from '@/file-exports/base.js';
import { RideAcceptanceStatusSchema, RideJustificationSourceSchema } from '@/operation/rides/ride-acceptance.js';
import { RideAnalysisGradeWithNoneSchema } from '@/operation/rides/ride-analysis.js';
import { DelayStatusSchema, OperationalStatusSchema, SeenStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */
/* DATA SCHEMA */
export const FlatRideSchema = z.object({
	/* META */
	/* * */
	_id: z.string().nullable(),
	agency_id: z.string().nullable(),
	driver_ids: z.string().nullable(),
	headsign: z.string().nullable(),
	line_id: z.number().nullable(),
	pattern_id: z.string().nullable(),
	plan_id: z.string().nullable(),
	route_id: z.string().nullable(),
	trip_id: z.string().nullable(),
	vehicle_ids: z.string().nullable(),

	/* TIME & STATUS */
	/* * */
	operational_date: z.string().nullable(),
	operational_status: z.string().nullable(),
	//
	start_delay_status: z.string().nullable(),
	start_time_observed: z.string().nullable(),
	start_time_scheduled: z.string().nullable(),
	//
	end_delay_status: z.string().nullable(),
	end_time_observed: z.string().nullable(),
	end_time_scheduled: z.string().nullable(),
	extension_observed: z.number().nullable(),
	extension_scheduled: z.number().nullable(),
	//
	seen_first_at: z.string().nullable(),
	seen_last_at: z.string().nullable(),
	seen_status: z.string().nullable(),

	/* PASSENGERS */
	/* * */
	passengers_estimated: z.number().nullable(),
	passengers_observed: z.number().nullable(),
	passengers_observed_on_board_sales_amount: z.number().nullable(),
	passengers_observed_on_board_sales_qty: z.number().nullable(),
	passengers_observed_prepaid_amount: z.number().nullable(),
	passengers_observed_prepaid_qty: z.number().nullable(),
	passengers_observed_subscription_qty: z.number().nullable(),

	/* APEX */
	/* * */
	apex_locations_qty: z.number().nullable(),
	apex_on_board_refunds_amount: z.number().nullable(),
	apex_on_board_refunds_qty: z.number().nullable(),
	apex_on_board_sales_amount: z.number().nullable(),
	apex_on_board_sales_qty: z.number().nullable(),
	apex_validations_qty: z.number().nullable(),

	/* ANALYSIS */
	/* * */
	// At Least One Vehicle Event On First Stop
	analysis_AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP: z.string().nullable(),
	// Ended At Last Stop
	analysis_ENDED_AT_LAST_STOP: z.string().nullable(),
	// Expected Apex Validation Interval
	analysis_EXPECTED_APEX_VALIDATION_INTERVAL: z.string().nullable(),
	// Driver ID
	analysis_EXPECTED_DRIVER_ID_QTY: z.string().nullable(),
	// Start Time
	analysis_EXPECTED_START_TIME: z.string().nullable(),
	analysis_EXPECTED_START_TIME_value: z.number().nullable(),
	// Vehicle Event
	analysis_EXPECTED_VEHICLE_EVENT_DELAY: z.string().nullable(),
	analysis_EXPECTED_VEHICLE_EVENT_INTERVAL: z.string().nullable(),
	analysis_EXPECTED_VEHICLE_EVENT_QTY: z.string().nullable(),
	analysis_EXPECTED_VEHICLE_EVENT_QTY_expected_qty: z.number().nullable(),
	analysis_EXPECTED_VEHICLE_EVENT_QTY_found_qty: z.number().nullable(),
	analysis_EXPECTED_VEHICLE_ID_QTY: z.string().nullable(),
	// Matching Apex Locations
	analysis_MATCHING_APEX_LOCATIONS: z.string().nullable(),
	analysis_MATCHING_VEHICLE_IDS: z.string().nullable(),
	// Simple One Apex Validation
	analysis_SIMPLE_ONE_APEX_VALIDATION: z.string().nullable(),
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION: z.string().nullable(),
	// Simple Three Vehicle Events
	analysis_SIMPLE_THREE_VEHICLE_EVENTS: z.string().nullable(),
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_reason: z.string().nullable(),
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_first: z.string().nullable(),
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_last: z.string().nullable(),
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_middle: z.string().nullable(),
	// Transaction Sequentiality
	analysis_TRANSACTION_SEQUENTIALITY: z.string().nullable(),
	analysis_TRANSACTION_SEQUENTIALITY_expected_qty: z.number().nullable(),
	analysis_TRANSACTION_SEQUENTIALITY_found_qty: z.number().nullable(),
	analysis_TRANSACTION_SEQUENTIALITY_missing_qty: z.number().nullable(),

	/* ACCEPTANCE / JUSTIFICATION */
	/* * */

	acceptance_status: z.enum(RideAcceptanceStatusSchema.options).nullish().nullable(),
	justification_cause: AlertCauseSchema.nullish().nullable(),
	justification_source: z.enum(RideJustificationSourceSchema.options).nullish().nullable(),
	manual_trip_id: z.string().nullish().nullable(),
	pto_message: z.string().min(2).max(5000).default('').nullish().nullable(),
});

/* PROPERTIES SCHEMA */
/* * */
export const RideExportPropertiesSchema = z.object({
	properties: z.object({
		agency_ids: z.array(z.string()).optional().nullable(),

		/* * */

		analysis_ended_at_last_stop: z.array(RideAnalysisGradeWithNoneSchema).optional().nullable(),
		analysis_expected_apex_validation_interval: z.array(RideAnalysisGradeWithNoneSchema).optional().nullable(),
		analysis_simple_three_vehicle_events: z.array(RideAnalysisGradeWithNoneSchema).optional().nullable(),
		analysis_transaction_sequentiality: z.array(RideAnalysisGradeWithNoneSchema).optional().nullable(),

		/* * */

		date_end: UnixTimestampSchema,
		date_start: UnixTimestampSchema,

		/* * */

		delay_statuses: z.array(DelayStatusSchema).optional().nullable(),
		operational_statuses: z.array(OperationalStatusSchema).optional().nullable(),
		seen_statuses: z.array(SeenStatusSchema).optional().nullable(),

		/* * */

		line_ids: z.array(z.string()).optional().nullable(),
		stop_ids: z.array(z.string()).optional().nullable(),

		/* * */
		acceptance_status: z.array(z.enum([...RideAcceptanceStatusSchema.options, 'none'])).optional().nullable(),
		search: z.string().optional().nullable(),
	}),
	type: z.literal('ride'),
});

/* CREATE SCHEMA */
/* * */
export const RideExportSchema = FileExportBaseSchema.extend(RideExportPropertiesSchema.shape);

/* TYPES */
/* * */
export type RideExportProperties = z.infer<typeof RideExportPropertiesSchema>;
export type RideExportData = z.infer<typeof FlatRideSchema>;
