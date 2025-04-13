/* * */

import { type ExtendedRideDisplay } from '@/contexts/Rides.context';
import { type Ride } from '@tmlmobilidade/types';
import { getUnixTimestamp } from '@tmlmobilidade/utils';

/**
 * This function returns the seen status of a ride based on the timestamp of its most recent event.
 * A ride is considered 'seen' if its most recent event is less than 30 seconds old;
 * 'gone' if its most recent event is more than 30 seconds old;
 * and 'unseen' if the ride has no events.
 * @param seenLastAt The timestamp of the most recent event of the ride.
 * @returns The seen status of the ride.
 */
export function getSeenStatus(seenLastAt?: Ride['seen_last_at']): ExtendedRideDisplay['seen_status'] {
	//

	if (!seenLastAt) {
		return 'unseen';
	}

	const nowInUnixMilliseconds = getUnixTimestamp();

	const millisecondsFromLastSeenToNow = nowInUnixMilliseconds - seenLastAt;

	if (millisecondsFromLastSeenToNow <= 30_000) {
		return 'seen';
	}

	return 'gone';

	//
}
