/* * */

import { type RideNormalized } from '@/types/normalized';
import { type Ride } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/**
 * This function normalizes a Ride object by adding additional properties
 * such as delay status, operational status, seen status, and formatted start times.
 * @param ride The Ride object to normalize.
 * @returns The normalized Ride object.
 */
export function getRideNormalized(ride: Ride): RideNormalized {
	const delayStatusValue = getDelayStatus(ride.start_time_scheduled, ride.start_time_observed);
	const operationalStatusValue = getOperationalStatus(ride.start_time_scheduled, ride.seen_last_at);
	const seenStatusValue = getSeenStatus(ride.seen_last_at);
	const simpleThreeVehicleEventsGrade = getSimpleThreeEventsGrade(operationalStatusValue, ride.analysis?.SIMPLE_THREE_VEHICLE_EVENTS?.grade);
	return {
		...ride,
		delay_status: delayStatusValue,
		delay_value_display: getDelayValueDisplay(ride.start_time_scheduled, ride.start_time_observed),
		operational_status: operationalStatusValue,
		seen_status: seenStatusValue,
		simple_three_vehicle_events_grade: simpleThreeVehicleEventsGrade,
		start_time_observed_display: ride.start_time_observed ? Dates.fromUnixTimestamp(ride.start_time_observed).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm') : null,
		start_time_scheduled_display: Dates.fromUnixTimestamp(ride.start_time_scheduled).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm'),
	};
}

/**
 * This function extract the hour and minute components from a date string.
 * @param timestamp The date string to extract the hour and minute components from.
 * @returns The hour and minute components of the date string.
 */
export function getSimpleThreeEventsGrade(operationalStatus: RideNormalized['operational_status'], grade?: Ride['analysis']['SIMPLE_THREE_VEHICLE_EVENTS']['grade']): RideNormalized['simple_three_vehicle_events_grade'] {
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
export function getDelayValueDisplay(startTimeScheduled: Ride['start_time_scheduled'], startTimeObserved: Ride['start_time_observed']): RideNormalized['delay_value_display'] {
	//

	if (!startTimeScheduled || !startTimeObserved) {
		return 'N/A';
	}

	const difference = startTimeObserved - startTimeScheduled;

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
export function getDelayStatus(startTimeScheduled: Ride['start_time_scheduled'], startTimeObserved: Ride['start_time_observed']): RideNormalized['delay_status'] {
	//

	if (!startTimeScheduled || !startTimeObserved) {
		return 'none';
	}

	const difference = startTimeObserved - startTimeScheduled;

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
