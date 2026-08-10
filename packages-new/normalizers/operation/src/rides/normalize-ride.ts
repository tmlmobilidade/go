/* * */

import { getAnalysisGrade } from '@/rides/get-analysis-grade.js';
import { getDelayStatus } from '@/rides/get-delay-status.js';
import { getDelayValueDisplay } from '@/rides/get-delay-value-display.js';
import { getOperationalStatus } from '@/rides/get-operational-status.js';
import { getSeenStatus } from '@/rides/get-seen-status.js';
import { Dates } from '@tmlmobilidade/dates';
import { type Ride, type RideAnalysisAtLeastOneVehicleEventOnLastStop, type RideAnalysisExpectedApexValidationInterval, type RideAnalysisSimpleThreeVehicleEvents, type RideAnalysisTransactionSequentiality, type RideNormalized } from '@tmlmobilidade/go-types-operation';

/**
 * This interface defines the parameters for the normalizeRide function.
 * @param analyses The required analyses of the Ride.
 * @param ride The ride to normalize.
 */
interface NormalizeRideParams {
	analyses: {
		at_least_one_vehicle_event_on_last_stop?: null | RideAnalysisAtLeastOneVehicleEventOnLastStop
		expected_apex_validation_interval?: null | RideAnalysisExpectedApexValidationInterval
		simple_three_vehicle_events?: null | RideAnalysisSimpleThreeVehicleEvents
		transaction_sequentiality?: null | RideAnalysisTransactionSequentiality
	}
	ride: Ride
}

/**
 * This function normalizes a Ride object by adding additional properties
 * such as delay status, operational status, seen status, and formatted start times.
 * @param ride The Ride object to normalize.
 * @returns The normalized Ride object.
 */
export function normalizeRide(params: NormalizeRideParams): RideNormalized {
	const operationalStatusValue = getOperationalStatus(params.ride.start_time_scheduled, params.ride.seen_last_at);
	return {
		...params.ride,
		acceptance_status: params.ride['acceptance_status'] ?? 'none',
		analysis_at_least_one_vehicle_event_on_last_stop_grade: getAnalysisGrade(operationalStatusValue, params.analyses.at_least_one_vehicle_event_on_last_stop?.grade_status),
		analysis_expected_apex_validation_interval: getAnalysisGrade(operationalStatusValue, params.analyses.expected_apex_validation_interval?.grade_status),
		analysis_simple_three_vehicle_events_grade: getAnalysisGrade(operationalStatusValue, params.analyses.simple_three_vehicle_events?.grade_status),
		analysis_transaction_sequentiality: getAnalysisGrade(operationalStatusValue, params.analyses.transaction_sequentiality?.grade_status),
		end_delay_status: getDelayStatus(params.ride.end_time_scheduled, params.ride.end_time_observed),
		end_delay_value_display: getDelayValueDisplay(params.ride.end_time_scheduled, params.ride.end_time_observed),
		end_time_observed_display: params.ride.end_time_observed ? Dates.fromUnixTimestamp(params.ride.end_time_observed).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm') : null,
		end_time_scheduled_display: Dates.fromUnixTimestamp(params.ride.end_time_scheduled).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm'),
		operational_status: operationalStatusValue,
		seen_status: getSeenStatus(params.ride.seen_last_at),
		start_delay_status: getDelayStatus(params.ride.start_time_scheduled, params.ride.start_time_observed),
		start_delay_value_display: getDelayValueDisplay(params.ride.start_time_scheduled, params.ride.start_time_observed),
		start_time_observed_display: params.ride.start_time_observed ? Dates.fromUnixTimestamp(params.ride.start_time_observed).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm') : null,
		start_time_scheduled_display: Dates.fromUnixTimestamp(params.ride.start_time_scheduled).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm'),
	};
}
