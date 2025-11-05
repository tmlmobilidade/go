/* * */

import { type Ride } from '@go/types';

/* * */

export interface FlatRide {
	_id: string
	agency_id: string
	analysis_AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP_grade: string
	analysis_AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP_reason: string
	analysis_ENDED_AT_LAST_STOP_grade: string
	analysis_ENDED_AT_LAST_STOP_reason: string
	analysis_EXPECTED_APEX_VALIDATION_INTERVAL_grade: string
	analysis_EXPECTED_APEX_VALIDATION_INTERVAL_reason: string
	analysis_EXPECTED_DRIVER_ID_QTY_grade: string
	analysis_EXPECTED_DRIVER_ID_QTY_reason: string
	analysis_EXPECTED_START_TIME_grade: string
	analysis_EXPECTED_START_TIME_reason: string
	analysis_EXPECTED_START_TIME_value: number
	analysis_EXPECTED_VEHICLE_EVENT_DELAY_grade: string
	analysis_EXPECTED_VEHICLE_EVENT_DELAY_reason: string
	analysis_EXPECTED_VEHICLE_EVENT_INTERVAL_grade: string
	analysis_EXPECTED_VEHICLE_EVENT_INTERVAL_reason: string
	analysis_EXPECTED_VEHICLE_EVENT_QTY_expected_qty: number
	analysis_EXPECTED_VEHICLE_EVENT_QTY_found_qty: number
	analysis_EXPECTED_VEHICLE_EVENT_QTY_grade: string
	analysis_EXPECTED_VEHICLE_EVENT_QTY_reason: string
	analysis_EXPECTED_VEHICLE_ID_QTY_grade: string
	analysis_EXPECTED_VEHICLE_ID_QTY_reason: string
	analysis_MATCHING_APEX_LOCATIONS_grade: string
	analysis_MATCHING_APEX_LOCATIONS_reason: string
	analysis_MATCHING_VEHICLE_IDS_grade: string
	analysis_MATCHING_VEHICLE_IDS_reason: string
	analysis_SIMPLE_ONE_APEX_VALIDATION_grade: string
	analysis_SIMPLE_ONE_APEX_VALIDATION_reason: string
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION_grade: string
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION_reason: string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_grade: string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_reason: string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_first: string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_last: string
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_middle: string
	analysis_TRANSACTION_SEQUENTIALITY_expected_qty: number
	analysis_TRANSACTION_SEQUENTIALITY_found_qty: number
	analysis_TRANSACTION_SEQUENTIALITY_grade: string
	analysis_TRANSACTION_SEQUENTIALITY_missing_qty: number
	analysis_TRANSACTION_SEQUENTIALITY_reason: string
	apex_locations_qty: number
	apex_on_board_refunds_amount: number
	apex_on_board_refunds_qty: number
	apex_on_board_sales_amount: number
	apex_on_board_sales_qty: number
	apex_validations_qty: number
	created_at: number
	driver_ids: string
	end_time_observed: number
	end_time_scheduled: number
	extension_observed: number
	extension_scheduled: number
	hashed_shape_id: string
	hashed_trip_id: string
	headsign: string
	is_locked: boolean
	line_id: number
	operational_date: string
	passengers_estimated: number
	passengers_observed: number
	passengers_observed_on_board_sales_amount: number
	passengers_observed_on_board_sales_qty: number
	passengers_observed_prepaid_amount: number
	passengers_observed_prepaid_qty: number
	passengers_observed_subscription_qty: number
	pattern_id: string
	plan_id: string
	route_id: string
	seen_first_at: number
	seen_last_at: number
	start_time_observed: number
	start_time_scheduled: number
	system_status: string
	trip_id: string
	updated_at: number
	vehicle_ids: string
}

/* * */

export const sampleRide: FlatRide = {
	_id: 'string',
	agency_id: 'string',
	analysis_AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP_grade: 'string',
	analysis_AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP_reason: 'string',
	analysis_ENDED_AT_LAST_STOP_grade: 'string',
	analysis_ENDED_AT_LAST_STOP_reason: 'string',
	analysis_EXPECTED_APEX_VALIDATION_INTERVAL_grade: 'string',
	analysis_EXPECTED_APEX_VALIDATION_INTERVAL_reason: 'string',
	analysis_EXPECTED_DRIVER_ID_QTY_grade: 'string',
	analysis_EXPECTED_DRIVER_ID_QTY_reason: 'string',
	analysis_EXPECTED_START_TIME_grade: 'string',
	analysis_EXPECTED_START_TIME_reason: 'string',
	analysis_EXPECTED_START_TIME_value: 0,
	analysis_EXPECTED_VEHICLE_EVENT_DELAY_grade: 'string',
	analysis_EXPECTED_VEHICLE_EVENT_DELAY_reason: 'string',
	analysis_EXPECTED_VEHICLE_EVENT_INTERVAL_grade: 'string',
	analysis_EXPECTED_VEHICLE_EVENT_INTERVAL_reason: 'string',
	analysis_EXPECTED_VEHICLE_EVENT_QTY_expected_qty: 0,
	analysis_EXPECTED_VEHICLE_EVENT_QTY_found_qty: 0,
	analysis_EXPECTED_VEHICLE_EVENT_QTY_grade: 'string',
	analysis_EXPECTED_VEHICLE_EVENT_QTY_reason: 'string',
	analysis_EXPECTED_VEHICLE_ID_QTY_grade: 'string',
	analysis_EXPECTED_VEHICLE_ID_QTY_reason: 'string',
	analysis_MATCHING_APEX_LOCATIONS_grade: 'string',
	analysis_MATCHING_APEX_LOCATIONS_reason: 'string',
	analysis_MATCHING_VEHICLE_IDS_grade: 'string',
	analysis_MATCHING_VEHICLE_IDS_reason: 'string',
	analysis_SIMPLE_ONE_APEX_VALIDATION_grade: 'string',
	analysis_SIMPLE_ONE_APEX_VALIDATION_reason: 'string',
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION_grade: 'string',
	analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION_reason: 'string',
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_grade: 'string',
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_reason: 'string',
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_first: 'string',
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_last: 'string',
	analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_middle: 'string',
	analysis_TRANSACTION_SEQUENTIALITY_expected_qty: 0,
	analysis_TRANSACTION_SEQUENTIALITY_found_qty: 0,
	analysis_TRANSACTION_SEQUENTIALITY_grade: 'string',
	analysis_TRANSACTION_SEQUENTIALITY_missing_qty: 0,
	analysis_TRANSACTION_SEQUENTIALITY_reason: 'string',
	apex_locations_qty: 0,
	apex_on_board_refunds_amount: 0,
	apex_on_board_refunds_qty: 0,
	apex_on_board_sales_amount: 0,
	apex_on_board_sales_qty: 0,
	apex_validations_qty: 0,
	created_at: 0,
	driver_ids: 'string',
	end_time_observed: 0,
	end_time_scheduled: 0,
	extension_observed: 0,
	extension_scheduled: 0,
	hashed_shape_id: 'string',
	hashed_trip_id: 'string',
	headsign: 'string',
	is_locked: false,
	line_id: 0,
	operational_date: 'string',
	passengers_estimated: 0,
	passengers_observed: 0,
	passengers_observed_on_board_sales_amount: 0,
	passengers_observed_on_board_sales_qty: 0,
	passengers_observed_prepaid_amount: 0,
	passengers_observed_prepaid_qty: 0,
	passengers_observed_subscription_qty: 0,
	pattern_id: 'string',
	plan_id: 'string',
	route_id: 'string',
	seen_first_at: 0,
	seen_last_at: 0,
	start_time_observed: 0,
	start_time_scheduled: 0,
	system_status: 'string',
	trip_id: 'string',
	updated_at: 0,
	vehicle_ids: 'vehicle1|vehicle2',
};

/* * */

export function parseRide(ride: Ride): FlatRide {
	return {
		_id: ride._id,
		agency_id: ride.agency_id,
		analysis_AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP_grade: ride.analysis?.AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP?.grade ?? '',
		analysis_AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP_reason: ride.analysis?.AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP?.reason ?? '',
		analysis_ENDED_AT_LAST_STOP_grade: ride.analysis?.ENDED_AT_LAST_STOP?.grade ?? '',
		analysis_ENDED_AT_LAST_STOP_reason: ride.analysis?.ENDED_AT_LAST_STOP?.reason ?? '',
		analysis_EXPECTED_APEX_VALIDATION_INTERVAL_grade: ride.analysis?.EXPECTED_APEX_VALIDATION_INTERVAL?.grade ?? '',
		analysis_EXPECTED_APEX_VALIDATION_INTERVAL_reason: ride.analysis?.EXPECTED_APEX_VALIDATION_INTERVAL?.reason ?? '',
		analysis_EXPECTED_DRIVER_ID_QTY_grade: ride.analysis?.EXPECTED_DRIVER_ID_QTY?.grade ?? '',
		analysis_EXPECTED_DRIVER_ID_QTY_reason: ride.analysis?.EXPECTED_DRIVER_ID_QTY?.reason ?? '',
		analysis_EXPECTED_START_TIME_grade: ride.analysis?.EXPECTED_START_TIME?.grade ?? '',
		analysis_EXPECTED_START_TIME_reason: ride.analysis?.EXPECTED_START_TIME?.reason ?? '',
		analysis_EXPECTED_START_TIME_value: ride.analysis?.EXPECTED_START_TIME?.value ?? 0,
		analysis_EXPECTED_VEHICLE_EVENT_DELAY_grade: ride.analysis?.EXPECTED_VEHICLE_EVENT_DELAY?.grade ?? '',
		analysis_EXPECTED_VEHICLE_EVENT_DELAY_reason: ride.analysis?.EXPECTED_VEHICLE_EVENT_DELAY?.reason ?? '',
		analysis_EXPECTED_VEHICLE_EVENT_INTERVAL_grade: ride.analysis?.EXPECTED_VEHICLE_EVENT_INTERVAL?.grade ?? '',
		analysis_EXPECTED_VEHICLE_EVENT_INTERVAL_reason: ride.analysis?.EXPECTED_VEHICLE_EVENT_INTERVAL?.reason ?? '',
		analysis_EXPECTED_VEHICLE_EVENT_QTY_expected_qty: ride.analysis?.EXPECTED_VEHICLE_EVENT_QTY?.expected_qty ?? 0,
		analysis_EXPECTED_VEHICLE_EVENT_QTY_found_qty: ride.analysis?.EXPECTED_VEHICLE_EVENT_QTY?.found_qty ?? 0,
		analysis_EXPECTED_VEHICLE_EVENT_QTY_grade: ride.analysis?.EXPECTED_VEHICLE_EVENT_QTY?.grade ?? '',
		analysis_EXPECTED_VEHICLE_EVENT_QTY_reason: ride.analysis?.EXPECTED_VEHICLE_EVENT_QTY?.reason ?? '',
		analysis_EXPECTED_VEHICLE_ID_QTY_grade: ride.analysis?.EXPECTED_VEHICLE_ID_QTY?.grade ?? '',
		analysis_EXPECTED_VEHICLE_ID_QTY_reason: ride.analysis?.EXPECTED_VEHICLE_ID_QTY?.reason ?? '',
		analysis_MATCHING_APEX_LOCATIONS_grade: ride.analysis?.MATCHING_APEX_LOCATIONS?.grade ?? '',
		analysis_MATCHING_APEX_LOCATIONS_reason: ride.analysis?.MATCHING_APEX_LOCATIONS?.reason ?? '',
		analysis_MATCHING_VEHICLE_IDS_grade: ride.analysis?.MATCHING_VEHICLE_IDS?.grade ?? '',
		analysis_MATCHING_VEHICLE_IDS_reason: ride.analysis?.MATCHING_VEHICLE_IDS?.reason ?? '',
		analysis_SIMPLE_ONE_APEX_VALIDATION_grade: ride.analysis?.SIMPLE_ONE_APEX_VALIDATION?.grade ?? '',
		analysis_SIMPLE_ONE_APEX_VALIDATION_reason: ride.analysis?.SIMPLE_ONE_APEX_VALIDATION?.reason ?? '',
		analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION_grade: ride.analysis?.SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION?.grade ?? '',
		analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION_reason: ride.analysis?.SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION?.reason ?? '',
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_grade: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.grade ?? '',
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_reason: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.reason ?? '',
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_first: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.stop_ids_first?.join('|') ?? '',
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_last: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.stop_ids_last?.join('|') ?? '',
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_middle: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.stop_ids_middle?.join('|') ?? '',
		analysis_TRANSACTION_SEQUENTIALITY_expected_qty: ride.analysis?.TRANSACTION_SEQUENTIALITY?.expected_qty ?? 0,
		analysis_TRANSACTION_SEQUENTIALITY_found_qty: ride.analysis?.TRANSACTION_SEQUENTIALITY?.found_qty ?? 0,
		analysis_TRANSACTION_SEQUENTIALITY_grade: ride.analysis?.TRANSACTION_SEQUENTIALITY?.grade ?? '',
		analysis_TRANSACTION_SEQUENTIALITY_missing_qty: ride.analysis?.TRANSACTION_SEQUENTIALITY?.missing_qty ?? 0,
		analysis_TRANSACTION_SEQUENTIALITY_reason: ride.analysis?.TRANSACTION_SEQUENTIALITY?.reason ?? '',
		apex_locations_qty: ride.apex_locations_qty ?? 0,
		apex_on_board_refunds_amount: ride.apex_on_board_refunds_amount ?? 0,
		apex_on_board_refunds_qty: ride.apex_on_board_refunds_qty ?? 0,
		apex_on_board_sales_amount: ride.apex_on_board_sales_amount ?? 0,
		apex_on_board_sales_qty: ride.apex_on_board_sales_qty ?? 0,
		apex_validations_qty: ride.apex_validations_qty ?? 0,
		created_at: ride.created_at,
		driver_ids: (ride.driver_ids ?? []).join('|'),
		end_time_observed: ride.end_time_observed ?? 0,
		end_time_scheduled: ride.end_time_scheduled,
		extension_observed: ride.extension_observed ?? 0,
		extension_scheduled: ride.extension_scheduled,
		hashed_shape_id: ride.hashed_shape_id,
		hashed_trip_id: ride.hashed_trip_id,
		headsign: ride.headsign,
		is_locked: false,
		line_id: ride.line_id,
		operational_date: ride.operational_date,
		passengers_estimated: ride.passengers_estimated ?? 0,
		passengers_observed: ride.passengers_observed ?? 0,
		passengers_observed_on_board_sales_amount: ride.passengers_observed_on_board_sales_amount ?? 0,
		passengers_observed_on_board_sales_qty: ride.passengers_observed_on_board_sales_qty ?? 0,
		passengers_observed_prepaid_amount: ride.passengers_observed_prepaid_amount ?? 0,
		passengers_observed_prepaid_qty: ride.passengers_observed_prepaid_qty ?? 0,
		passengers_observed_subscription_qty: ride.passengers_observed_subscription_qty ?? 0,
		pattern_id: ride.pattern_id,
		plan_id: ride.plan_id,
		route_id: ride.route_id,
		seen_first_at: ride.seen_first_at ?? 0,
		seen_last_at: ride.seen_last_at ?? 0,
		start_time_observed: ride.start_time_observed ?? 0,
		start_time_scheduled: ride.start_time_scheduled,
		system_status: ride.system_status,
		trip_id: ride.trip_id,
		updated_at: ride.updated_at,
		vehicle_ids: (ride.vehicle_ids ?? []).join('|'),
	};
}
