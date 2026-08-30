/* * */

import { type OperationalDateInt, type TemporalStatus } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export function getPlanTemporalStatus(startDate: OperationalDateInt, endDate: OperationalDateInt): TemporalStatus {
	//

	//
	// Get current date in Unix timestamp format

	const nowInUnixMilliseconds = Dates
		.now('Europe/Lisbon')
		.unix_milliseconds;

	//
	// Parse start and end dates to Unix timestamp format

	const startDateUnixMilliseconds = Dates
		.fromOperationalDateInt(startDate, 'Europe/Lisbon')
		.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
		.unix_milliseconds;

	const endDateUnixMilliseconds = Dates
		.fromOperationalDateInt(endDate, 'Europe/Lisbon')
		.plus({ days: 1 })
		.set({ hour: 3, millisecond: 59, minute: 59, second: 59 })
		.unix_milliseconds;

	//
	// Return validity status

	if (nowInUnixMilliseconds > startDateUnixMilliseconds && nowInUnixMilliseconds > endDateUnixMilliseconds) return 'expired';

	if (nowInUnixMilliseconds >= startDateUnixMilliseconds && nowInUnixMilliseconds <= endDateUnixMilliseconds) return 'active';

	if (nowInUnixMilliseconds < startDateUnixMilliseconds && nowInUnixMilliseconds < endDateUnixMilliseconds) return 'upcoming';
};
