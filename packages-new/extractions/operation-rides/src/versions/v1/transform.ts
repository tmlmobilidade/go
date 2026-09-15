/* eslint-disable perfectionist/sort-objects */

import { OperationRidesV1OutputRowType, OperationRidesV1QueryRow } from './types.js';

export const toOutputRow = (row: OperationRidesV1QueryRow): OperationRidesV1OutputRowType => {
	console.log('original row', row);
	return {

		'_id': row._id,
		'agency_id': row.agency_id,
		'driver_ids': row.driver_ids.join('|'),
		'end_time_observed': row.end_time_observed,
		'end_time_scheduled': row.end_time_scheduled,
		'extension_observed': row.extension_observed,
		'extension_scheduled': row.extension_scheduled,
		'headsign': row.headsign,
		'line_id': row.route_short_name,
		'operational_date': row.operational_date,
		'passengers_estimated': row.passengers_estimated,
		'pattern_id': row.shape_id,
		'plan_id': row.plan_id,
		'route_id': row.route_id,
		'seen_first_at': row.seen_first_at,
		'seen_last_at': row.seen_last_at,
		'start_time_observed': row.start_time_observed,
		'start_time_scheduled': row.start_time_scheduled,
		'status': row.processing_status,
		'trip_id': row.trip_id,
		'validations_count': row.apex_validations_qty,
		'vehicle_ids': row.vehicle_ids.join('|'),

		'AT_MOST_TWO_DRIVER_IDS-grade': row.analysis_expected_driver_id_qty_grade_status,
		'AT_MOST_TWO_DRIVER_IDS-message': null,
		'AT_MOST_TWO_DRIVER_IDS-reason': row.analysis_expected_driver_id_qty_reason,
		'AT_MOST_TWO_DRIVER_IDS-unit': null,
		'AT_MOST_TWO_DRIVER_IDS-value': row.analysis_expected_driver_id_qty_observed_driver_ids_qty,

		'AT_MOST_TWO_VEHICLE_IDS-grade': null,
		'AT_MOST_TWO_VEHICLE_IDS-message': null,
		'AT_MOST_TWO_VEHICLE_IDS-reason': row.analysis_expected_vehicle_id_qty_reason,
		'AT_MOST_TWO_VEHICLE_IDS-unit': null,
		'AT_MOST_TWO_VEHICLE_IDS-value': row.analysis_expected_vehicle_id_qty_observed_vehicle_ids_qty,

		'EXCESSIVE_VEHICLE_EVENT_DELAY-grade': row.analysis_expected_vehicle_event_delay_grade_status,
		'EXCESSIVE_VEHICLE_EVENT_DELAY-message': null,
		'EXCESSIVE_VEHICLE_EVENT_DELAY-reason': row.analysis_expected_vehicle_event_delay_reason,
		'EXCESSIVE_VEHICLE_EVENT_DELAY-unit': null,
		'EXCESSIVE_VEHICLE_EVENT_DELAY-value': row.analysis_expected_vehicle_event_delay_vehicle_events_with_delay_qty,

		'HIGHEST_VEHICLE_EVENT_DELAY-grade': null,
		'HIGHEST_VEHICLE_EVENT_DELAY-message': null,
		'HIGHEST_VEHICLE_EVENT_DELAY-reason': null,
		'HIGHEST_VEHICLE_EVENT_DELAY-unit': null,
		'HIGHEST_VEHICLE_EVENT_DELAY-value': null,

		'LESS_THAN_TEN_VEHICLE_EVENTS-grade': row.analysis_expected_vehicle_event_qty_grade_status,
		'LESS_THAN_TEN_VEHICLE_EVENTS-message': null,
		'LESS_THAN_TEN_VEHICLE_EVENTS-reason': row.analysis_expected_vehicle_event_qty_reason,
		'LESS_THAN_TEN_VEHICLE_EVENTS-unit': null,
		'LESS_THAN_TEN_VEHICLE_EVENTS-value': null,

		'AVG_INTERVAL_VEHICLE_EVENTS-grade': row.analysis_expected_vehicle_event_interval_grade_status,
		'AVG_INTERVAL_VEHICLE_EVENTS-message': null,
		'AVG_INTERVAL_VEHICLE_EVENTS-reason': row.analysis_expected_vehicle_event_interval_reason,
		'AVG_INTERVAL_VEHICLE_EVENTS-unit': null,
		'AVG_INTERVAL_VEHICLE_EVENTS-value': row.analysis_expected_vehicle_event_interval_observed_average_interval,

		'MATCHING_LOCATION_TRANSACTIONS-grade': row.analysis_matching_apex_locations_grade_status,
		'MATCHING_LOCATION_TRANSACTIONS-message': null,
		'MATCHING_LOCATION_TRANSACTIONS-reason': row.analysis_matching_apex_locations_reason,
		'MATCHING_LOCATION_TRANSACTIONS-unit': null,
		'MATCHING_LOCATION_TRANSACTIONS-value': null,

		'ONTIME_START-grade': row.analysis_expected_start_time_grade_status,
		'ONTIME_START-message': null,
		'ONTIME_START-reason': row.analysis_expected_start_time_reason,
		'ONTIME_START-unit': null,
		'ONTIME_START-value': row.start_time_observed,

		'SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION-grade': row.analysis_simple_one_vehicle_event_or_apex_validation_grade_status,
		'SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION-message': null,
		'SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION-reason': row.analysis_simple_one_vehicle_event_or_apex_validation_reason,
		'SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION-unit': null,
		'SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION-value': null,

		'SIMPLE_ONE_VALIDATION_TRANSACTION-grade': row.analysis_simple_one_apex_validation_grade_status,
		'SIMPLE_ONE_VALIDATION_TRANSACTION-message': null,
		'SIMPLE_ONE_VALIDATION_TRANSACTION-reason': row.analysis_simple_one_apex_validation_reason,
		'SIMPLE_ONE_VALIDATION_TRANSACTION-unit': null,
		'SIMPLE_ONE_VALIDATION_TRANSACTION-value': null,

		'SIMPLE_THREE_VEHICLE_EVENTS-grade': row.analysis_simple_three_vehicle_events_grade_status,
		'SIMPLE_THREE_VEHICLE_EVENTS-message': null,
		'SIMPLE_THREE_VEHICLE_EVENTS-reason': row.analysis_simple_three_vehicle_events_reason,
		'SIMPLE_THREE_VEHICLE_EVENTS-unit': null,
		'SIMPLE_THREE_VEHICLE_EVENTS-value': null,

		'AT_LEAST_ONE_EVENT_ON_FIRST_STOP-grade': row.analysis_at_least_one_vehicle_event_on_first_stop_grade_status,
		'AT_LEAST_ONE_EVENT_ON_FIRST_STOP-message': null,
		'AT_LEAST_ONE_EVENT_ON_FIRST_STOP-reason': row.analysis_at_least_one_vehicle_event_on_first_stop_reason,
		'AT_LEAST_ONE_EVENT_ON_FIRST_STOP-unit': null,
		'AT_LEAST_ONE_EVENT_ON_FIRST_STOP-value': row.analysis_at_least_one_vehicle_event_on_first_stop_vehicle_events_on_first_stop_qty,

	};
};
