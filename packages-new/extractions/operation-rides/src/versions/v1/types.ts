/* eslint-disable perfectionist/sort-interfaces */

import { type RideAnalysisAtLeastOneVehicleEventOnFirstStop, RideAnalysisAtLeastOneVehicleEventOnLastStop, RideAnalysisExpectedDriverIdQty, RideAnalysisExpectedStartTime, RideAnalysisExpectedVehicleEventDelay, RideAnalysisExpectedVehicleEventInterval, RideAnalysisExpectedVehicleEventQty, RideAnalysisExpectedVehicleIdQty, RideAnalysisMatchingApexLocations, RideAnalysisSimpleOneApexValidation, RideAnalysisSimpleOneVehicleEventOrApexValidation, RideAnalysisSimpleThreeVehicleEvents, RideAnalysisTransactionSequentiality } from '@tmlmobilidade/go-types-operation';
import { type GradeStatus } from '@tmlmobilidade/go-types-shared';

export interface OperationRidesV1OutputRowType {

	'_id': string
	'agency_id': string
	'driver_ids': string // pipe-separated list of driver IDs (ex: '123|456|789')
	'end_time_observed': null | number
	'end_time_scheduled': null | number
	'extension_observed': null | number
	'extension_scheduled': number
	'headsign': string
	'line_id': string
	'operational_date': number
	'passengers_estimated': null | number
	'pattern_id': string
	'plan_id': string
	'route_id': string
	'seen_first_at': null | number
	'seen_last_at': null | number
	'start_time_observed': null | number
	'start_time_scheduled': null | number
	'status': string
	'trip_id': string
	'validations_count': null | number
	'vehicle_ids': string // pipe-separated list of vehicle IDs (ex: '123|456|789')

	'AT_MOST_TWO_DRIVER_IDS-grade': GradeStatus | null
	'AT_MOST_TWO_DRIVER_IDS-message': null
	'AT_MOST_TWO_DRIVER_IDS-reason': RideAnalysisExpectedDriverIdQty['reason']
	'AT_MOST_TWO_DRIVER_IDS-unit': null
	'AT_MOST_TWO_DRIVER_IDS-value': RideAnalysisExpectedDriverIdQty['observed_driver_ids_qty']

	'AT_MOST_TWO_VEHICLE_IDS-grade': GradeStatus | null
	'AT_MOST_TWO_VEHICLE_IDS-message': null
	'AT_MOST_TWO_VEHICLE_IDS-reason': RideAnalysisExpectedVehicleIdQty['reason']
	'AT_MOST_TWO_VEHICLE_IDS-unit': null
	'AT_MOST_TWO_VEHICLE_IDS-value': RideAnalysisExpectedVehicleIdQty['observed_vehicle_ids_qty']

	'EXCESSIVE_VEHICLE_EVENT_DELAY-grade': GradeStatus | null
	'EXCESSIVE_VEHICLE_EVENT_DELAY-message': null
	'EXCESSIVE_VEHICLE_EVENT_DELAY-reason': RideAnalysisExpectedVehicleEventDelay['reason']
	'EXCESSIVE_VEHICLE_EVENT_DELAY-unit': null
	'EXCESSIVE_VEHICLE_EVENT_DELAY-value': RideAnalysisExpectedVehicleEventDelay['vehicle_events_with_delay_qty']

	'HIGHEST_VEHICLE_EVENT_DELAY-grade': null
	'HIGHEST_VEHICLE_EVENT_DELAY-message': null
	'HIGHEST_VEHICLE_EVENT_DELAY-reason': null
	'HIGHEST_VEHICLE_EVENT_DELAY-unit': null
	'HIGHEST_VEHICLE_EVENT_DELAY-value': null

	'LESS_THAN_TEN_VEHICLE_EVENTS-grade': GradeStatus | null
	'LESS_THAN_TEN_VEHICLE_EVENTS-message': null
	'LESS_THAN_TEN_VEHICLE_EVENTS-reason': RideAnalysisExpectedVehicleEventQty['reason']
	'LESS_THAN_TEN_VEHICLE_EVENTS-unit': null
	'LESS_THAN_TEN_VEHICLE_EVENTS-value': null

	'AVG_INTERVAL_VEHICLE_EVENTS-grade': GradeStatus | null
	'AVG_INTERVAL_VEHICLE_EVENTS-message': null
	'AVG_INTERVAL_VEHICLE_EVENTS-reason': RideAnalysisExpectedVehicleEventInterval['reason']
	'AVG_INTERVAL_VEHICLE_EVENTS-unit': null
	'AVG_INTERVAL_VEHICLE_EVENTS-value': RideAnalysisExpectedVehicleEventInterval['observed_average_interval']

	'MATCHING_LOCATION_TRANSACTIONS-grade': GradeStatus | null
	'MATCHING_LOCATION_TRANSACTIONS-message': null
	'MATCHING_LOCATION_TRANSACTIONS-reason': RideAnalysisMatchingApexLocations['reason']
	'MATCHING_LOCATION_TRANSACTIONS-unit': null
	'MATCHING_LOCATION_TRANSACTIONS-value': null

	'ONTIME_START-grade': GradeStatus | null
	'ONTIME_START-message': null
	'ONTIME_START-reason': RideAnalysisExpectedStartTime['reason']
	'ONTIME_START-unit': null
	'ONTIME_START-value': null | number

	'SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION-grade': GradeStatus | null
	'SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION-message': null
	'SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION-reason': RideAnalysisSimpleOneVehicleEventOrApexValidation['reason']
	'SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION-unit': null
	'SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION-value': null

	'SIMPLE_ONE_VALIDATION_TRANSACTION-grade': GradeStatus | null
	'SIMPLE_ONE_VALIDATION_TRANSACTION-message': null
	'SIMPLE_ONE_VALIDATION_TRANSACTION-reason': RideAnalysisSimpleOneApexValidation['reason']
	'SIMPLE_ONE_VALIDATION_TRANSACTION-unit': null
	'SIMPLE_ONE_VALIDATION_TRANSACTION-value': null

	'SIMPLE_THREE_VEHICLE_EVENTS-grade': GradeStatus | null
	'SIMPLE_THREE_VEHICLE_EVENTS-message': null | string
	'SIMPLE_THREE_VEHICLE_EVENTS-reason': RideAnalysisSimpleThreeVehicleEvents['reason']
	'SIMPLE_THREE_VEHICLE_EVENTS-unit': null
	'SIMPLE_THREE_VEHICLE_EVENTS-value': null

	'AT_LEAST_ONE_EVENT_ON_FIRST_STOP-grade': GradeStatus | null
	'AT_LEAST_ONE_EVENT_ON_FIRST_STOP-message': null
	'AT_LEAST_ONE_EVENT_ON_FIRST_STOP-reason': RideAnalysisAtLeastOneVehicleEventOnFirstStop['reason']
	'AT_LEAST_ONE_EVENT_ON_FIRST_STOP-unit': null
	'AT_LEAST_ONE_EVENT_ON_FIRST_STOP-value': RideAnalysisAtLeastOneVehicleEventOnFirstStop['vehicle_events_on_first_stop_qty']

}

export interface OperationRidesV1QueryRow {
	_id: string
	agency_id: string
	driver_ids: string[]
	end_time_observed: null | number
	end_time_scheduled: number
	extension_observed: null | number
	extension_scheduled: number
	headsign: string
	operational_date: number
	passengers_estimated: null | number
	plan_id: string
	route_id: string
	route_short_name: string
	seen_first_at: null | number
	seen_last_at: null | number
	shape_id: string
	start_time_observed: null | number
	start_time_scheduled: number
	processing_status: string
	trip_id: string
	apex_validations_qty: null | number
	vehicle_ids: string[]

	analysis_at_least_one_vehicle_event_on_first_stop_grade_status: GradeStatus | null
	analysis_at_least_one_vehicle_event_on_first_stop_reason: null | RideAnalysisAtLeastOneVehicleEventOnFirstStop['reason']
	analysis_at_least_one_vehicle_event_on_first_stop_vehicle_events_on_first_stop_qty: null | number

	analysis_at_least_one_vehicle_event_on_last_stop_grade_status: GradeStatus | null
	analysis_at_least_one_vehicle_event_on_last_stop_reason: null | RideAnalysisAtLeastOneVehicleEventOnLastStop['reason']
	analysis_at_least_one_vehicle_event_on_last_stop_vehicle_events_on_last_stop_qty: null | number

	analysis_expected_driver_id_qty_grade_status: GradeStatus | null
	analysis_expected_driver_id_qty_reason: null | RideAnalysisExpectedDriverIdQty['reason']
	analysis_expected_driver_id_qty_observed_driver_ids_qty: null | number

	analysis_expected_start_time_grade_status: GradeStatus | null
	analysis_expected_start_time_reason: null | RideAnalysisExpectedStartTime['reason']
	analysis_expected_start_time_observed_start_time: null | number
	analysis_expected_start_time_observed_start_time_delta: null | number

	analysis_expected_vehicle_event_delay_grade_status: GradeStatus | null
	analysis_expected_vehicle_event_delay_reason: null | RideAnalysisExpectedVehicleEventDelay['reason']
	analysis_expected_vehicle_event_delay_observed_average_delay: null | number
	analysis_expected_vehicle_event_delay_observed_max_delay: null | number
	analysis_expected_vehicle_event_delay_observed_min_delay: null | number
	analysis_expected_vehicle_event_delay_vehicle_events_qty: null | number
	analysis_expected_vehicle_event_delay_vehicle_events_with_delay_percent: null | number
	analysis_expected_vehicle_event_delay_vehicle_events_with_delay_qty: null | number

	analysis_expected_vehicle_event_interval_grade_status: GradeStatus | null
	analysis_expected_vehicle_event_interval_reason: null | RideAnalysisExpectedVehicleEventInterval['reason']
	analysis_expected_vehicle_event_interval_observed_average_interval: null | number
	analysis_expected_vehicle_event_interval_observed_max_interval: null | number
	analysis_expected_vehicle_event_interval_observed_min_interval: null | number

	analysis_expected_vehicle_event_qty_grade_status: GradeStatus | null
	analysis_expected_vehicle_event_qty_reason: null | RideAnalysisExpectedVehicleEventQty['reason']
	analysis_expected_vehicle_event_qty_expected_vehicle_events_qty: null | number
	analysis_expected_vehicle_event_qty_observed_vehicle_events_qty: null | number

	analysis_expected_vehicle_id_qty_grade_status: GradeStatus | null
	analysis_expected_vehicle_id_qty_reason: null | RideAnalysisExpectedVehicleIdQty['reason']
	analysis_expected_vehicle_id_qty_observed_vehicle_ids_qty: null | number

	analysis_matching_apex_locations_grade_status: GradeStatus | null
	analysis_matching_apex_locations_reason: null | RideAnalysisMatchingApexLocations['reason']
	analysis_matching_apex_locations_expected_apex_locations_qty: null | number
	analysis_matching_apex_locations_matching_apex_locations_qty: null | number
	analysis_matching_apex_locations_missing_apex_locations_qty: null | number

	analysis_simple_one_apex_validation_grade_status: GradeStatus | null
	analysis_simple_one_apex_validation_reason: null | RideAnalysisSimpleOneApexValidation['reason']

	analysis_simple_one_vehicle_event_or_apex_validation_grade_status: GradeStatus | null
	analysis_simple_one_vehicle_event_or_apex_validation_reason: null | RideAnalysisSimpleOneVehicleEventOrApexValidation['reason']

	analysis_simple_three_vehicle_events_grade_status: GradeStatus | null
	analysis_simple_three_vehicle_events_reason: null | RideAnalysisSimpleThreeVehicleEvents['reason']
	analysis_simple_three_vehicle_events_stop_ids_first: null | string
	analysis_simple_three_vehicle_events_stop_ids_middle: null | string
	analysis_simple_three_vehicle_events_stop_ids_last: null | string

	analysis_transaction_sequentiality_grade_status: GradeStatus | null
	analysis_transaction_sequentiality_reason: null | RideAnalysisTransactionSequentiality['reason']
	analysis_transaction_sequentiality_expected_transactions_qty: null | number
	analysis_transaction_sequentiality_found_transactions_qty: null | number
	analysis_transaction_sequentiality_missing_transactions_qty: null | number
}
