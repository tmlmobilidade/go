/* * */

import { Dates } from '@tmlmobilidade/dates';
import { getCurrentEnvironment } from '@tmlmobilidade/types';

/**
 * Get the earliest date for data synchronization
 * based on the current environment.
 * @returns A Dates object with the earliest date for synchronization.
 */
export function getEarliestDate(): Dates {
	//

	//
	// In production, return the fixed date of
	// 1 January 2024, in the Europe/Lisbon timezone.

	if (getCurrentEnvironment() === 'production') {
		return Dates
			.fromOperationalDate('20240101', 'Europe/Lisbon')
			.set({ hour: 4, millisecond: 0, minute: 0, second: 0 });
	}

	//
	// In non-production environments, return
	// the date one week ago from now.

	return Dates
		.now('Europe/Lisbon')
		.minus({ weeks: 1 })
		.set({ hour: 4, millisecond: 0, minute: 0, second: 0 });

	//
};
