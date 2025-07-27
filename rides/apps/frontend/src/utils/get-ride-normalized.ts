/* * */

import { type RideNormalized } from '@/types/normalized';
import { getDelayStatus } from '@/utils/get-delay-status';
import { getOperationalStatus } from '@/utils/get-operational-status';
import { getSeenStatus } from '@/utils/get-seen-status';
import { type Ride } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/**
 * This function normalizes a Ride object by adding additional properties
 * such as delay status, operational status, seen status, and formatted start times.
 * @param ride The Ride object to normalize.
 * @returns The normalized Ride object.
 */
export function getRideNormalized(ride: Ride): RideNormalized {
	return {
		...ride,
		delay_status: getDelayStatus(ride.start_time_scheduled, ride.start_time_observed),
		operational_status: getOperationalStatus(ride.start_time_scheduled, ride.seen_last_at),
		seen_status: getSeenStatus(ride.seen_last_at),
		simple_three_vehicle_events_grade: ride.analysis.SIMPLE_THREE_VEHICLE_EVENTS?.grade ?? null,
		start_time_observed_display: ride.start_time_observed ? Dates.fromUnixTimestamp(ride.start_time_observed).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm') : null,
		start_time_scheduled_display: Dates.fromUnixTimestamp(ride.start_time_scheduled).setZone('Europe/Lisbon', 'offset_only').toFormat('HH:mm'),
	};
}
