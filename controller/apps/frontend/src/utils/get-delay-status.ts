/* * */

import { type RideNormalized } from '@/types/normalized';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This function extract the hour and minute components from a date string.
 * @param timestamp The date string to extract the hour and minute components from.
 * @returns The hour and minute components of the date string.
 */
export function getDelayStatus(startTimeScheduled: Ride['start_time_scheduled'], startTimeObserved: Ride['start_time_observed']): RideNormalized['delay_status'] {
	//

	if (!startTimeScheduled || !startTimeObserved) {
		return null;
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
