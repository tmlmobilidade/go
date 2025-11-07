/* * */

import { delayStatusValues, type RideNormalized } from '@/ride-normalized.js';
import { Dates } from '@tmlmobilidade/dates';
import { type Ride, type RideAnalysis, type UnixTimestamp } from '@tmlmobilidade/types';

/**
 * This function normalizes a Ride object by adding additional properties
 * such as delay status, operational status, seen status, and formatted start times.
 * @param ride The Ride object to normalize.
 * @returns The normalized Ride object.
 */
export function normalizeRide(ride: Ride): RideNormalized {
	const operationalStatusValue = getOperationalStatus(ride.start_time_scheduled, ride.seen_last_at);
	return {
		...ride,
		acceptance_status: ride['acceptance_status'] ?? 'none',
		analysis_ended_at_last_stop_grade: getAnalysisGrade(operationalStatusValue, ride.analysis?.ENDED_AT_LAST_STOP?.grade),
		analysis_expected_apex_validation_interval: getAnalysisGrade(operationalStatusValue, ride.analysis?.EXPECTED_APEX_VALIDATION_INTERVAL?.grade),
		analysis_simple_three_vehicle_events_grade: getAnalysisGrade(operationalStatusValue, ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.grade),
		analysis_transaction_sequentiality: getAnalysisGrade(operationalStatusValue, ride.analysis?.TRANSACTION_SEQUENTIALITY?.grade),
		delay_status: getDelayStatus(ride.start_time_scheduled, ride.start_time_observed),
		delay_value_display: getDelayValueDisplay(ride.start_time_scheduled, ride.start_time_observed),
		end_delay_status: getDelayStatus(ride.end_time_scheduled, ride.end_time_observed),
		end_delay_value_display: getDelayValueDisplay(ride.end_time_scheduled, ride.end_time_observed),
		end_time_observed_display: ride.end_time_observed ? Dates.fromUnixTimestamp(ride.end_time_observed).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm') : null,
		end_time_scheduled_display: Dates.fromUnixTimestamp(ride.end_time_scheduled).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm'),
		operational_status: operationalStatusValue,
		seen_status: getSeenStatus(ride.seen_last_at),
		start_delay_status: getDelayStatus(ride.start_time_scheduled, ride.start_time_observed),
		start_delay_value_display: getDelayValueDisplay(ride.start_time_scheduled, ride.start_time_observed),
		start_time_observed_display: ride.start_time_observed ? Dates.fromUnixTimestamp(ride.start_time_observed).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm') : null,
		start_time_scheduled_display: Dates.fromUnixTimestamp(ride.start_time_scheduled).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm'),
	};
}

/**
 * This function returns the analysis grade for a given Ride, based on its operational status and the provided grade.
 * @param operationalStatus The operational status of the Ride.
 * @param grade The grade to return if the operational status is not 'scheduled' or 'running'.
 * @returns The analysis grade for the Ride.
 */
export function getAnalysisGrade(operationalStatus: RideNormalized['operational_status'], grade?: Ride['analysis']['SIMPLE_THREE_VEHICLE_EVENTS']['grade']): 'none' | RideAnalysis['grade'] {
	//

	if (operationalStatus === 'scheduled' || operationalStatus === 'running') {
		return 'none';
	}

	return grade ?? 'none';

	//
}

/**
 * This function extract the hour and minute components from a date string.
 * @param timestamp The date string to extract the hour and minute components from.
 * @returns The hour and minute components of the date string.
 */
export function getDelayValueDisplay(timeScheduled: Ride['start_time_scheduled'], timeObserved: Ride['start_time_observed']): RideNormalized['delay_value_display'] {
	//

	if (!timeScheduled || !timeObserved) {
		return 'N/A';
	}

	const difference = timeObserved - timeScheduled;

	const sign = difference < 0 ? '-' : '';
	const absDiff = Math.abs(difference);

	const minutes = Math.floor(absDiff / 60000);
	const seconds = Math.floor((absDiff % 60000) / 1000);

	if (minutes === 0) {
		return `${sign}${seconds}s`;
	}
	return `${sign}${minutes}m ${seconds}s`;

	//
}

/**
 * This function extract the hour and minute components from a date string.
 * @param timestamp The date string to extract the hour and minute components from.
 * @returns The hour and minute components of the date string.
 */
export function getDelayStatus(timeScheduled: UnixTimestamp, timeObserved: UnixTimestamp): typeof delayStatusValues[number] {
	//

	if (!timeScheduled || !timeObserved) {
		return 'none';
	}

	const difference = timeObserved - timeScheduled;

	// 5 minutes late
	if (difference > 300000) {
		return 'delayed';
	}

	// 1 minute early
	if (difference < -60000) {
		return 'early';
	}

	return 'ontime';

	//
}

/**
 * This function returns the correct operational status for a given Ride, base on its 'scheduled_start_time' and 'seen_last_at' values.
 * A Ride can be considered 'scheduled', 'missed', 'running' or 'ended'.
 * Value 'scheduled' means that the ride start time is still in the future, and no Vehicle Events were found for it.
 * Value 'missed' means that the ride start time is at least 10 minutes ago, and no Vehicle Events were found for it.
 * Value 'running' means that the value of seen_last_at is from less than 10 minutes ago.
 * Value 'ended' means that the value of seen_last_at is from more than 10 minutes ago.
 * @param startTimeScheduled The scheduled start time for the Ride.
 * @param seenLastAt The timestamp of the most recent Vehicle Event for the Ride.
 * @returns The operational status for the Ride.
 */
export function getOperationalStatus(startTimeScheduled: Ride['start_time_scheduled'], seenLastAt: Ride['seen_last_at']): RideNormalized['operational_status'] {
	//

	//
	// Check if the ride start time is in the future.

	const nowInUnixMilliseconds = Dates.now('Europe/Lisbon').unix_timestamp;

	const millisecondsFromRideStartToNow = nowInUnixMilliseconds - startTimeScheduled;

	//
	// If the ride start time is less than or equal to 10 minutes ago, or in the future,
	// and there are no VehicleEvents for it, then the ride is considered 'scheduled'.

	if (millisecondsFromRideStartToNow <= 600000 && !seenLastAt) {
		return 'scheduled';
	}

	//
	// If the ride start time is at least 10 minutes ago, and there are no VehicleEvents for it,
	// then the ride is considered 'missed' and no further analysis is needed.

	if (millisecondsFromRideStartToNow > 600000 && !seenLastAt) {
		return 'missed';
	}

	//
	// If there is seen_last_at for the ride, and the most recent one was received less than or exactly at 10 minutes ago,
	// then the ride is considered 'running'. Else it is considered 'ended'.

	const millisecondsFromMostRecentVehicleEventToNow = nowInUnixMilliseconds - seenLastAt;

	if (millisecondsFromMostRecentVehicleEventToNow <= 600000) {
		return 'running';
	}

	return 'ended';

	//
}

/**
 * This function returns the seen status of a ride based on the timestamp of its most recent event.
 * A ride is considered 'seen' if its most recent event is less than 30 seconds old;
 * 'gone' if its most recent event is more than 30 seconds old;
 * and 'unseen' if the ride has no events.
 * @param seenLastAt The timestamp of the most recent event of the ride.
 * @returns The seen status of the ride.
 */
export function getSeenStatus(seenLastAt?: Ride['seen_last_at']): RideNormalized['seen_status'] {
	//

	if (!seenLastAt) {
		return 'unseen';
	}

	const nowInUnixMilliseconds = Dates.now('Europe/Lisbon').unix_timestamp;

	const millisecondsFromLastSeenToNow = nowInUnixMilliseconds - seenLastAt;

	if (millisecondsFromLastSeenToNow <= 30_000) {
		return 'seen';
	}

	return 'gone';

	//
}
