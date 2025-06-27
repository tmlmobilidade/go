/* * */

import { type Ride } from '@tmlmobilidade/types';

/* * */

export interface FlatRide {
	_id: string
	agency_id: string
	apex_locations_qty: null | number
	apex_on_board_refunds_amount: null | number
	apex_on_board_refunds_qty: null | number
	apex_on_board_sales_amount: null | number
	apex_on_board_sales_qty: null | number
	apex_validations_qty: null | number
	at_least_one_event_on_first_stop_grade: string
	// at_least_one_event_on_first_stop_message: null | string
	at_least_one_event_on_first_stop_reason: null | string
	// at_least_one_event_on_first_stop_unit: null | string
	at_least_one_event_on_first_stop_value: null | number
	at_most_two_driver_ids_grade: string
	// at_most_two_driver_ids_message: null | string
	at_most_two_driver_ids_reason: null | string
	// at_most_two_driver_ids_unit: null | string
	at_most_two_driver_ids_value: null | number
	at_most_two_vehicle_ids_grade: string
	// at_most_two_vehicle_ids_message: null | string
	at_most_two_vehicle_ids_reason: null | string
	// at_most_two_vehicle_ids_unit: null | string
	at_most_two_vehicle_ids_value: null | number
	avg_interval_vehicle_events_grade: string
	// avg_interval_vehicle_events_message: null | string
	avg_interval_vehicle_events_reason: null | string
	// avg_interval_vehicle_events_unit: null | string
	avg_interval_vehicle_events_value: null | number
	created_at: number
	driver_ids: null | string
	end_time_observed: null | number
	end_time_scheduled: number
	excessive_vehicle_event_delay_grade: string
	// excessive_vehicle_event_delay_message: null | string
	excessive_vehicle_event_delay_reason: null | string
	// excessive_vehicle_event_delay_unit: null | string
	excessive_vehicle_event_delay_value: null | number
	execution_status: null | string
	extension_observed: null | number
	extension_scheduled: number
	hashed_shape_id: string
	hashed_trip_id: string
	headsign: string
	is_locked: boolean
	less_than_ten_vehicle_events_grade: string
	// less_than_ten_vehicle_events_message: null | string
	less_than_ten_vehicle_events_reason: null | string
	// less_than_ten_vehicle_events_unit: null | string
	less_than_ten_vehicle_events_value: null | number
	line_id: number
	matching_location_transactions_grade: string
	// matching_location_transactions_message: null | string
	matching_location_transactions_reason: null | string
	// matching_location_transactions_unit: null | string
	matching_location_transactions_value: null | number
	ontime_start_grade: string
	// ontime_start_message: null | string
	ontime_start_reason: null | string
	// ontime_start_unit: null | string
	ontime_start_value: null | number
	operational_date: string
	passengers_estimated: null | number
	passengers_observed: null | number
	pattern_id: string
	plan_id: string
	route_id: string
	seen_first_at: null | number
	seen_last_at: null | number
	simple_one_validation_transaction_grade: string
	// simple_one_validation_transaction_message: null | string
	simple_one_validation_transaction_reason: null | string
	// simple_one_validation_transaction_unit: null | string
	simple_one_validation_transaction_value: null | number
	simple_one_vehicle_event_or_validation_transaction_grade: string
	// simple_one_vehicle_event_or_validation_transaction_message: null | string
	simple_one_vehicle_event_or_validation_transaction_reason: null | string
	// simple_one_vehicle_event_or_validation_transaction_unit: null | string
	simple_one_vehicle_event_or_validation_transaction_value: null | number
	simple_three_vehicle_events_grade: string
	// simple_three_vehicle_events_message: null | string
	simple_three_vehicle_events_reason: null | string
	// simple_three_vehicle_events_unit: null | string
	simple_three_vehicle_events_value: null | number
	start_time_observed: null | number
	start_time_scheduled: number
	system_status: string
	transaction_sequentiality_grade: string
	// transaction_sequentiality_message: null | string
	transaction_sequentiality_reason: null | string
	// transaction_sequentiality_unit: null | string
	transaction_sequentiality_value: null | number
	trip_id: string
	updated_at: number
	validations_count: null | number
	vehicle_ids: null | string
}

/* * */

export const sampleRide: FlatRide = {
	_id: 'string',
	agency_id: 'string',
	apex_locations_qty: 0,
	apex_on_board_refunds_amount: 0,
	apex_on_board_refunds_qty: 0,
	apex_on_board_sales_amount: 0,
	apex_on_board_sales_qty: 0,
	apex_validations_qty: 0,
	at_least_one_event_on_first_stop_grade: 'string',
	at_least_one_event_on_first_stop_reason: 'string',
	at_least_one_event_on_first_stop_value: 0,
	at_most_two_driver_ids_grade: 'string',
	at_most_two_driver_ids_reason: 'string',
	at_most_two_driver_ids_value: 0,
	at_most_two_vehicle_ids_grade: 'string',
	at_most_two_vehicle_ids_reason: 'string',
	at_most_two_vehicle_ids_value: 0,
	avg_interval_vehicle_events_grade: 'string',
	avg_interval_vehicle_events_reason: 'string',
	avg_interval_vehicle_events_value: 0,
	created_at: 0,
	driver_ids: 'string',
	end_time_observed: 0,
	end_time_scheduled: 0,
	excessive_vehicle_event_delay_grade: 'string',
	excessive_vehicle_event_delay_reason: 'string',
	excessive_vehicle_event_delay_value: 0,
	execution_status: 'string',
	extension_observed: 0,
	extension_scheduled: 0,
	hashed_shape_id: 'string',
	hashed_trip_id: 'string',
	headsign: 'string',
	is_locked: false,
	less_than_ten_vehicle_events_grade: 'string',
	less_than_ten_vehicle_events_reason: 'string',
	less_than_ten_vehicle_events_value: 0,
	line_id: 0,
	matching_location_transactions_grade: 'string',
	matching_location_transactions_reason: 'string',
	matching_location_transactions_value: 0,
	ontime_start_grade: 'string',
	ontime_start_reason: 'string',
	ontime_start_value: 0,
	operational_date: 'string',
	passengers_estimated: 0,
	passengers_observed: 0,
	pattern_id: 'string',
	plan_id: 'string',
	route_id: 'string',
	seen_first_at: 0,
	seen_last_at: 0,
	simple_one_validation_transaction_grade: 'string',
	simple_one_validation_transaction_reason: 'string',
	simple_one_validation_transaction_value: 0,
	simple_one_vehicle_event_or_validation_transaction_grade: 'string',
	simple_one_vehicle_event_or_validation_transaction_reason: 'string',
	simple_one_vehicle_event_or_validation_transaction_value: 0,
	simple_three_vehicle_events_grade: 'string',
	simple_three_vehicle_events_reason: 'string',
	simple_three_vehicle_events_value: 0,
	start_time_observed: 0,
	start_time_scheduled: 0,
	system_status: 'string',
	transaction_sequentiality_grade: 'string',
	transaction_sequentiality_reason: 'string',
	transaction_sequentiality_value: 0,
	trip_id: 'string',
	updated_at: 0,
	validations_count: 0, // Legacy field
	vehicle_ids: 'vehicle1|vehicle2',
};

/* * */

export function parseRide(ride: Ride): FlatRide {
	return {
		_id: ride._id,
		agency_id: ride.agency_id,
		apex_locations_qty: ride.apex_locations_qty,
		apex_on_board_refunds_amount: ride.apex_on_board_refunds_amount,
		apex_on_board_refunds_qty: ride.apex_on_board_refunds_qty,
		apex_on_board_sales_amount: ride.apex_on_board_sales_amount,
		apex_on_board_sales_qty: ride.apex_on_board_sales_qty,
		apex_validations_qty: ride.apex_validations_qty,
		at_least_one_event_on_first_stop_grade: ride.analysis?.AT_LEAST_ONE_EVENT_ON_FIRST_STOP?.grade ?? null,
		at_least_one_event_on_first_stop_reason: ride.analysis?.AT_LEAST_ONE_EVENT_ON_FIRST_STOP?.reason ?? null,
		at_least_one_event_on_first_stop_value: ride.analysis?.AT_LEAST_ONE_EVENT_ON_FIRST_STOP?.value ?? null,
		at_most_two_driver_ids_grade: ride.analysis?.AT_MOST_TWO_DRIVER_IDS?.grade ?? null,
		at_most_two_driver_ids_reason: ride.analysis?.AT_MOST_TWO_DRIVER_IDS?.reason ?? null,
		at_most_two_driver_ids_value: ride.analysis?.AT_MOST_TWO_DRIVER_IDS?.value ?? null,
		at_most_two_vehicle_ids_grade: ride.analysis?.AT_MOST_TWO_VEHICLE_IDS?.grade ?? null,
		at_most_two_vehicle_ids_reason: ride.analysis?.AT_MOST_TWO_VEHICLE_IDS?.reason ?? null,
		at_most_two_vehicle_ids_value: ride.analysis?.AT_MOST_TWO_VEHICLE_IDS?.value ?? null,
		avg_interval_vehicle_events_grade: ride.analysis?.AVG_INTERVAL_VEHICLE_EVENTS?.grade ?? null,
		avg_interval_vehicle_events_reason: ride.analysis?.AVG_INTERVAL_VEHICLE_EVENTS?.reason ?? null,
		avg_interval_vehicle_events_value: ride.analysis?.AVG_INTERVAL_VEHICLE_EVENTS?.value ?? null,
		created_at: ride.created_at,
		driver_ids: (ride.driver_ids ?? []).join('|'),
		end_time_observed: ride.end_time_observed,
		end_time_scheduled: ride.end_time_scheduled,
		excessive_vehicle_event_delay_grade: ride.analysis?.EXCESSIVE_VEHICLE_EVENT_DELAY?.grade ?? null,
		excessive_vehicle_event_delay_reason: ride.analysis?.EXCESSIVE_VEHICLE_EVENT_DELAY?.reason ?? null,
		excessive_vehicle_event_delay_value: ride.analysis?.EXCESSIVE_VEHICLE_EVENT_DELAY?.value ?? null,
		execution_status: ride.execution_status ?? '',
		extension_observed: ride.extension_observed,
		extension_scheduled: ride.extension_scheduled,
		hashed_shape_id: ride.hashed_shape_id,
		hashed_trip_id: ride.hashed_trip_id,
		headsign: ride.headsign,
		is_locked: ride.is_locked,
		less_than_ten_vehicle_events_grade: ride.analysis?.LESS_THAN_TEN_VEHICLE_EVENTS?.grade ?? null,
		less_than_ten_vehicle_events_reason: ride.analysis?.LESS_THAN_TEN_VEHICLE_EVENTS?.reason ?? null,
		less_than_ten_vehicle_events_value: ride.analysis?.LESS_THAN_TEN_VEHICLE_EVENTS?.value ?? null,
		line_id: ride.line_id,
		matching_location_transactions_grade: ride.analysis?.MATCHING_LOCATION_TRANSACTIONS?.grade ?? null,
		matching_location_transactions_reason: ride.analysis?.AVG_INTERVAL_VEHICLE_EVENTS?.reason ?? null,
		matching_location_transactions_value: ride.analysis?.MATCHING_LOCATION_TRANSACTIONS?.value ?? null,
		ontime_start_grade: ride.analysis?.ONTIME_START?.grade ?? null,
		ontime_start_reason: ride.analysis?.ONTIME_START?.reason ?? null,
		ontime_start_value: ride.analysis?.ONTIME_START?.value ?? null,
		operational_date: ride.operational_date,
		passengers_estimated: ride.passengers_estimated,
		passengers_observed: ride.passengers_observed,
		pattern_id: ride.pattern_id,
		plan_id: ride.plan_id,
		route_id: ride.route_id,
		seen_first_at: ride.seen_first_at,
		seen_last_at: ride.seen_last_at,
		simple_one_validation_transaction_grade: ride.analysis?.SIMPLE_ONE_VALIDATION_TRANSACTION?.grade ?? null,
		simple_one_validation_transaction_reason: ride.analysis?.SIMPLE_ONE_VALIDATION_TRANSACTION?.reason ?? null,
		simple_one_validation_transaction_value: ride.analysis?.SIMPLE_ONE_VALIDATION_TRANSACTION?.value ?? null,
		simple_one_vehicle_event_or_validation_transaction_grade: ride.analysis?.SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION?.grade ?? null,
		simple_one_vehicle_event_or_validation_transaction_reason: ride.analysis?.SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION?.reason ?? null,
		simple_one_vehicle_event_or_validation_transaction_value: ride.analysis?.SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION?.value ?? null,
		simple_three_vehicle_events_grade: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.grade ?? null,
		simple_three_vehicle_events_reason: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.reason ?? null,
		simple_three_vehicle_events_value: ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.value ?? null,
		start_time_observed: ride.start_time_observed,
		start_time_scheduled: ride.start_time_scheduled,
		system_status: ride.system_status,
		transaction_sequentiality_grade: ride.analysis?.TRANSACTION_SEQUENTIALITY?.grade ?? null,
		transaction_sequentiality_reason: ride.analysis?.TRANSACTION_SEQUENTIALITY?.reason ?? null,
		transaction_sequentiality_value: ride.analysis?.TRANSACTION_SEQUENTIALITY?.value ?? null,
		trip_id: ride.trip_id,
		updated_at: ride.updated_at,
		validations_count: ride.passengers_observed,
		vehicle_ids: (ride.vehicle_ids ?? []).join('|'),
	};
}
