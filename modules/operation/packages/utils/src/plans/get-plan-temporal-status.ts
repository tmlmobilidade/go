/* * */

import { type OperationalDateInt, type TemporalStatus } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export function getPlanTemporalStatus(activeFrom: OperationalDateInt, activeUntil: OperationalDateInt): TemporalStatus {
	//

	//
	// Get current date in Unix timestamp format

	const nowInUnixMilliseconds = Dates
		.now('Europe/Lisbon')
		.unix_milliseconds;

	//
	// Parse start and end dates to Unix timestamp format

	const activeFromUnixMilliseconds = Dates
		.fromOperationalDateInt(activeFrom, 'Europe/Lisbon')
		.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
		.unix_milliseconds;

	const activeUntilUnixMilliseconds = Dates
		.fromOperationalDateInt(activeUntil, 'Europe/Lisbon')
		.plus({ days: 1 })
		.set({ hour: 3, millisecond: 59, minute: 59, second: 59 })
		.unix_milliseconds;

	//
	// Return validity status

	if (nowInUnixMilliseconds > activeFromUnixMilliseconds && nowInUnixMilliseconds > activeUntilUnixMilliseconds) return 'expired';

	if (nowInUnixMilliseconds >= activeFromUnixMilliseconds && nowInUnixMilliseconds <= activeUntilUnixMilliseconds) return 'active';

	if (nowInUnixMilliseconds < activeFromUnixMilliseconds && nowInUnixMilliseconds < activeUntilUnixMilliseconds) return 'upcoming';

	throw new Error('Invalid temporal status');
};
