/* * */

import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';

/**
 * This function extract the hour and minute components from a date string.
 * @param timestamp The date string to extract the hour and minute components from.
 * @returns The hour and minute components of the date string.
 */
export function getDelayValueDisplay(timeScheduled: UnixTimestamp, timeObserved?: null | UnixTimestamp): null | string {
	//

	if (!timeScheduled || !timeObserved) return null;

	const difference = timeObserved - timeScheduled;

	const sign = difference < 0 ? '-' : '';
	const absDiff = Math.abs(difference);

	const minutes = Math.floor(absDiff / 60000);
	const seconds = Math.floor((absDiff % 60000) / 1000);

	if (minutes === 0) {
		return `${sign}${seconds}s`;
	}

	return `${sign}${minutes}m ${seconds}s`;
}
