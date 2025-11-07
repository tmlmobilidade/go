/* * */

import { type PlanNormalized } from '@/types/normalized';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

export const getPlanValidityStatus = (startDate: OperationalDate, endDate: OperationalDate): PlanNormalized['validity_status'] => {
	//

	//
	// Get current date in Unix timestamp format

	const nowInUnixTimestamp = Dates
		.now('Europe/Lisbon')
		.unix_timestamp;

	//
	// Parse start and end dates to Unix timestamp format

	const startDateUnixTimestamp = Dates
		.fromOperationalDate(startDate, 'Europe/Lisbon')
		.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
		.unix_timestamp;

	const endDateUnixTimestamp = Dates
		.fromOperationalDate(endDate, 'Europe/Lisbon')
		.plus({ days: 1 })
		.set({ hour: 3, millisecond: 59, minute: 59, second: 59 })
		.unix_timestamp;

	//
	// Return validity status

	if (nowInUnixTimestamp > startDateUnixTimestamp && nowInUnixTimestamp > endDateUnixTimestamp) return 'expired';

	if (nowInUnixTimestamp >= startDateUnixTimestamp && nowInUnixTimestamp <= endDateUnixTimestamp) return 'active';

	if (nowInUnixTimestamp < startDateUnixTimestamp && nowInUnixTimestamp < endDateUnixTimestamp) return 'upcoming';

	//
};
