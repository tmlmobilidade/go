/* eslint-disable perfectionist/sort-interfaces */

import { type AlertCause, type RideAcceptanceStatus, type RideJustificationSource } from '@tmlmobilidade/go-types-operation';
import { type DelayStatus, type GradeStatus, type OperationalStatus, type SeenStatus, type TimezoneIdentified } from '@tmlmobilidade/go-types-shared';

/*
 * ClickHouse quotes 64-bit integers in JSON output, so every Int64 column
 * (the millisecond timestamps) arrives as a string. Narrower integer columns
 * arrive as numbers.
 */
export interface OperationRidesV2QueryRow {
	_id: string
	agency_id: string
	apex_locations_qty: null | number
	apex_refunds_amount: null | number
	apex_refunds_qty: null | number
	apex_sales_amount: null | number
	apex_sales_qty: null | number
	apex_validations_qty: null | number
	driver_ids: string[]
	end_time_observed: null | string
	end_time_scheduled: null | string
	extension_observed: null | number
	extension_scheduled: null | number
	headsign: string
	operational_date: number
	passengers_estimated: null | number
	passengers_observed: null | number
	passengers_observed_prepaid_amount: null | number
	passengers_observed_prepaid_qty: null | number
	passengers_observed_sales_amount: null | number
	passengers_observed_sales_qty: null | number
	passengers_observed_subscription_qty: null | number
	plan_id: string
	route_id: string
	route_short_name: string
	seen_first_at: null | string
	seen_last_at: null | string
	shape_id: string
	start_time_observed: null | string
	start_time_scheduled: null | string
	timezone: TimezoneIdentified
	trip_id: string
	vehicle_ids: string[]

	operational_status: OperationalStatus
	seen_status: SeenStatus
	start_delay_status: DelayStatus | null
	end_delay_status: DelayStatus | null

	analysis_at_least_one_vehicle_event_on_first_stop_grade: GradeStatus | null
	analysis_at_least_one_vehicle_event_on_last_stop_grade: GradeStatus | null
	analysis_expected_apex_validation_interval_grade: GradeStatus | null
	analysis_expected_driver_id_qty_grade: GradeStatus | null
	analysis_expected_start_time_grade: GradeStatus | null
	analysis_expected_start_time_observed_start_time_delta: null | number
	analysis_expected_vehicle_event_delay_grade: GradeStatus | null
	analysis_expected_vehicle_event_interval_grade: GradeStatus | null
	analysis_expected_vehicle_event_qty_grade: GradeStatus | null
	analysis_expected_vehicle_event_qty_expected_vehicle_events_qty: null | number
	analysis_expected_vehicle_event_qty_observed_vehicle_events_qty: null | number
	analysis_expected_vehicle_id_qty_grade: GradeStatus | null
	analysis_matching_apex_locations_grade: GradeStatus | null
	analysis_matching_vehicle_ids_grade: GradeStatus | null
	analysis_simple_one_apex_validation_grade: GradeStatus | null
	analysis_simple_one_vehicle_event_or_apex_validation_grade: GradeStatus | null
	analysis_simple_three_vehicle_events_grade: GradeStatus | null
	analysis_simple_three_vehicle_events_reason: null | string
	analysis_simple_three_vehicle_events_stop_ids_first: string[]
	analysis_simple_three_vehicle_events_stop_ids_last: string[]
	analysis_simple_three_vehicle_events_stop_ids_middle: string[]
	analysis_transaction_sequentiality_grade: GradeStatus | null
	analysis_transaction_sequentiality_expected_transactions_qty: null | number
	analysis_transaction_sequentiality_found_transactions_qty: null | number
	analysis_transaction_sequentiality_missing_transactions_qty: null | number
}

/*
 * The output row keeps the column names and the column order of the previous
 * Rides export, so that files produced by this version stay compatible with
 * the spreadsheets and scripts already built around it.
 */
export interface OperationRidesV2OutputRow {

	_id: null | string
	agency_id: null | string
	driver_ids: null | string
	headsign: null | string
	line_id: null | string
	pattern_id: null | string
	plan_id: null | string
	route_id: null | string
	trip_id: null | string
	vehicle_ids: null | string

	operational_date: null | string
	operational_status: null | string

	start_delay_status: null | string
	start_time_observed: null | string
	start_time_scheduled: null | string

	end_delay_status: null | string
	end_time_observed: null | string
	end_time_scheduled: null | string
	extension_observed: null | number
	extension_scheduled: null | number

	seen_first_at: null | string
	seen_last_at: null | string
	seen_status: null | string

	passengers_estimated: null | number
	passengers_observed: null | number
	passengers_observed_on_board_sales_amount: null | number
	passengers_observed_on_board_sales_qty: null | number
	passengers_observed_prepaid_amount: null | number
	passengers_observed_prepaid_qty: null | number
	passengers_observed_subscription_qty: null | number

	apex_locations_qty: null | number
	apex_on_board_refunds_amount: null | number
	apex_on_board_refunds_qty: null | number
	apex_on_board_sales_amount: null | number
	apex_on_board_sales_qty: null | number
	apex_validations_qty: null | number

	analysis_AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP: GradeStatus | null
	analysis_ENDED_AT_LAST_STOP: GradeStatus | null
	analysis_EXPECTED_APEX_VALIDATION_INTERVAL: GradeStatus | null
	analysis_EXPECTED_DRIVER_ID_QTY: GradeStatus | null
	analysis_EXPECTED_START_TIME: GradeStatus | null
	analysis_EXPECTED_START_TIME_value: null | number
	analysis_EXPECTED_VEHICLE_EVENT_DELAY: GradeStatus | null
	analysis_EXPECTED_VEHICLE_EVENT_INTERVAL: GradeStatus | null
	analysis_EXPECTED_VEHICLE_EVENT_QTY: GradeStatus | null
	analysis_EXPECTED_VEHICLE_EVENT_QTY_expected_qty: null | number
	analysis_EXPECTED_VEHICLE_EVENT_QTY_found_qty: null | number
	analysis_EXPECTED_VEHICLE_ID_QTY: GradeStatus | null
	analysis_MATCHING_APEX_LOCATIONS: GradeStatus | null
	analysis_MATCHING_VEHICLE_IDS: GradeStatus | null
	analysis_SIMPLE_ONE_APEX_VALIDATION: GradeStatus | null
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION: GradeStatus | null
	analysis_SIMPLE_THREE_VEHICLE_EVENTS: GradeStatus | null
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_reason: null | string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_first: null | string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_last: null | string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_middle: null | string
	analysis_TRANSACTION_SEQUENTIALITY: GradeStatus | null
	analysis_TRANSACTION_SEQUENTIALITY_expected_qty: null | number
	analysis_TRANSACTION_SEQUENTIALITY_found_qty: null | number
	analysis_TRANSACTION_SEQUENTIALITY_missing_qty: null | number

	acceptance_status: null | RideAcceptanceStatus
	justification_cause: AlertCause | null
	justification_source: null | RideJustificationSource
	manual_trip_id: null | string
	pto_message: null | string

}
