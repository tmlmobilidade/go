/* * */

import { DelayStatusSchema, OperationalStatusSchema, SeenStatusSchema } from '@/_common/status.js';
import { unixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { FileExportBaseSchema } from '@/file-exports/common.js';
import { gtfsCauseSchema } from '@/gtfs/cause-effetcs.js';
import { RideAcceptanceStatusSchema, RideJustificationSourceSchema } from '@/rides/ride-acceptance.js';
import { RideAnalysisGradeWithNoneSchema } from '@/rides/ride-analysis.js';
import { z } from 'zod';

/* * */
/* DATA SCHEMA */
export const FlatRideSchema = z.object({
	/* META */
	/* * */
	_id: z.string(),
	agency_id: z.string(),
	driver_ids: z.string(),
	headsign: z.string(),
	line_id: z.number(),
	pattern_id: z.string(),
	plan_id: z.string(),
	route_id: z.string(),
	trip_id: z.string(),
	vehicle_ids: z.string(),

	/* TIME & STATUS */
	/* * */
	operational_date: z.string(),
	operational_status: z.string(),
	//
	start_delay_status: z.string(),
	start_time_observed: z.string(),
	start_time_scheduled: z.string(),
	//
	end_delay_status: z.string(),
	end_time_observed: z.string(),
	end_time_scheduled: z.string(),
	extension_observed: z.number(),
	extension_scheduled: z.number(),
	//
	seen_first_at: z.string(),
	seen_last_at: z.string(),
	seen_status: z.string(),

	/* PASSENGERS */
	/* * */
	passengers_estimated: z.number(),
	passengers_observed: z.number(),
	passengers_observed_on_board_sales_amount: z.number(),
	passengers_observed_on_board_sales_qty: z.number(),
	passengers_observed_prepaid_amount: z.number(),
	passengers_observed_prepaid_qty: z.number(),
	passengers_observed_subscription_qty: z.number(),

	/* APEX */
	/* * */
	apex_locations_qty: z.number(),
	apex_on_board_refunds_amount: z.number(),
	apex_on_board_refunds_qty: z.number(),
	apex_on_board_sales_amount: z.number(),
	apex_on_board_sales_qty: z.number(),
	apex_validations_qty: z.number(),

	/* ANALYSIS */
	/* * */
	analysis_AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP: z.string(),
	analysis_ENDED_AT_LAST_STOP: z.string(),
	analysis_EXPECTED_APEX_VALIDATION_INTERVAL: z.string(),
	analysis_EXPECTED_DRIVER_ID_QTY: z.string(),
	analysis_EXPECTED_START_TIME: z.string(),
	analysis_EXPECTED_START_TIME_value: z.number(),
	analysis_EXPECTED_VEHICLE_EVENT_DELAY: z.string(),
	analysis_EXPECTED_VEHICLE_EVENT_INTERVAL: z.string(),
	analysis_EXPECTED_VEHICLE_EVENT_QTY: z.string(),
	analysis_EXPECTED_VEHICLE_EVENT_QTY_expected_qty: z.number(),
	analysis_EXPECTED_VEHICLE_EVENT_QTY_found_qty: z.number(),
	analysis_EXPECTED_VEHICLE_ID_QTY: z.string(),
	analysis_MATCHING_APEX_LOCATIONS: z.string(),
	analysis_MATCHING_VEHICLE_IDS: z.string(),
	analysis_SIMPLE_ONE_APEX_VALIDATION: z.string(),
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION: z.string(),
	analysis_SIMPLE_THREE_VEHICLE_EVENTS: z.string(),
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_first: z.string(),
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_last: z.string(),
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_middle: z.string(),
	analysis_TRANSACTION_SEQUENTIALITY: z.string(),
	analysis_TRANSACTION_SEQUENTIALITY_expected_qty: z.number(),
	analysis_TRANSACTION_SEQUENTIALITY_found_qty: z.number(),
	analysis_TRANSACTION_SEQUENTIALITY_missing_qty: z.number(),

	/* ACCEPTANCE / JUSTIFICATION */
	/* * */

	acceptance_status: z.enum(RideAcceptanceStatusSchema.options).nullish(),
	justification_cause: gtfsCauseSchema.nullish(),
	justification_source: z.enum(RideJustificationSourceSchema.options).nullish(),
	manual_trip_id: z.string().nullish(),
	pto_message: z.string().min(2).max(5000).default('').nullish(),
});

/* PROPERTIES SCHEMA */
/* * */
export const RideExportPropertiesSchema = z.object({
	properties: z.object({
		agency_ids: z.array(z.string()).optional(),

		/* * */

		analysis_ended_at_last_stop: z.array(RideAnalysisGradeWithNoneSchema).optional(),
		analysis_expected_apex_validation_interval: z.array(RideAnalysisGradeWithNoneSchema).optional(),
		analysis_simple_three_vehicle_events: z.array(RideAnalysisGradeWithNoneSchema).optional(),
		analysis_transaction_sequentiality: z.array(RideAnalysisGradeWithNoneSchema).optional(),

		/* * */

		date_end: unixTimeStampSchema,
		date_start: unixTimeStampSchema,

		/* * */

		delay_statuses: z.array(DelayStatusSchema).optional(),
		operational_statuses: z.array(OperationalStatusSchema).optional(),
		seen_statuses: z.array(SeenStatusSchema).optional(),

		/* * */

		line_ids: z.array(z.string()).optional(),
		stop_ids: z.array(z.string()).optional(),

		/* * */
		acceptance_status: z.array(z.enum([...RideAcceptanceStatusSchema.options, 'none'])).optional(),
	}),
	type: z.literal('ride'),
});

/* CREATE SCHEMA */
/* * */
export const RideExportSchema = FileExportBaseSchema.extend(RideExportPropertiesSchema.shape).strict();

/* TYPES */
/* * */
export type RideExportProperties = z.infer<typeof RideExportPropertiesSchema>;
export type RideExportData = z.infer<typeof FlatRideSchema>;
