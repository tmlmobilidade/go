/* * */

import { type DelayStatus, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';

/**
 * This function returns the delay status of a ride based on its scheduled and observed times.
 * @param timeScheduled The scheduled time of the ride.
 * @param timeObserved The observed time of the ride.
 * @returns The delay status of the ride.
 */
export function getDelayStatus(timeScheduled: UnixTimestamp, timeObserved: null | UnixTimestamp): 'none' | DelayStatus {
	//

	if (!timeObserved) return 'none';

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
}
