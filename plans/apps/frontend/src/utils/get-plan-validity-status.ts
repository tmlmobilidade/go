/* * */

import { type PlanNormalized } from '@/types/normalized';
import { type OperationalDate } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

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
		.unix_timestamp;

	const endDateUnixTimestamp = Dates
		.fromOperationalDate(endDate, 'Europe/Lisbon')
		.unix_timestamp;

	//
	// Return validity status

	if (nowInUnixTimestamp > startDateUnixTimestamp && nowInUnixTimestamp > endDateUnixTimestamp) return 'expired';

	if (nowInUnixTimestamp >= startDateUnixTimestamp && nowInUnixTimestamp <= endDateUnixTimestamp) return 'active';

	if (nowInUnixTimestamp < startDateUnixTimestamp && nowInUnixTimestamp < endDateUnixTimestamp) return 'upcoming';

	//
};
