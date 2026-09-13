/* eslint-disable perfectionist/sort-interfaces */

import { type RideAnalysisAtLeastOneVehicleEventOnFirstStop, RideAnalysisExpectedDriverIdQty, RideAnalysisExpectedStartTime, RideAnalysisExpectedVehicleEventDelay, RideAnalysisExpectedVehicleEventInterval, RideAnalysisExpectedVehicleEventQty, RideAnalysisExpectedVehicleIdQty, RideAnalysisMatchingApexLocations, RideAnalysisSimpleOneApexValidation, RideAnalysisSimpleOneVehicleEventOrApexValidation, RideAnalysisSimpleThreeVehicleEvents } from '@tmlmobilidade/go-types-operation';
import { type GradeStatus } from '@tmlmobilidade/go-types-shared';

export interface OperationRidesV1OutputRowType {

	'_id': string
	'agency_id': string
	'driver_ids': string
	'end_time_observed': null | number
	'end_time_scheduled': null | number
	'extension_observed': null | number
	'extension_scheduled': number
	'headsign': string
	'line_id': number
	'operational_date': string
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
	'vehicle_ids': string

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
	'ONTIME_START-value': RideAnalysisExpectedStartTime['observed_start_time']

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
