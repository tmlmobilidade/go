/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type SeenStatus, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';

/**
 * This function returns the seen status of a ride based on the timestamp of its most recent event.
 * A ride is considered 'seen' if its most recent event is less than 30 seconds old;
 * 'gone' if its most recent event is more than 30 seconds old;
 * and 'unseen' if the ride has no events.
 * @param seenLastAt The timestamp of the most recent event of the ride.
 * @returns The seen status of the ride.
 */
export function getSeenStatus(seenLastAt?: null | UnixTimestamp): SeenStatus {
	//

	if (!seenLastAt) return 'unseen';

	const nowInUnixMilliseconds = Dates.now('utc').unix_timestamp;

	const millisecondsFromLastSeenToNow = nowInUnixMilliseconds - seenLastAt;

	if (millisecondsFromLastSeenToNow <= 30_000) {
		return 'seen';
	}

	return 'gone';
}
