/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDate, type UnixTimestamp } from '@tmlmobilidade/types';

/* * */

export function convertGTFSTimeStringAndOperationalDateToUnixTimestamp(timeString: string, operationalDate: OperationalDate): UnixTimestamp {
	//

	// Return early if no time string is provided
	if (!timeString || !operationalDate) throw new Error(`✖︎ No time string or operational date provided. timeString: ${timeString}, operationalDate: ${operationalDate}`);

	// Check if the timestring is in the format HH:MM:SS
	if (!/^\d{2}:\d{2}:\d{2}$/.test(timeString)) throw new Error(`✖︎ Invalid time string format. timeString: ${timeString}`);

	// Extract the individual components of the time string (HH:MM:SS)
	const [hoursOperation, minutesOperation, secondsOperation] = timeString.split(':').map(Number);

	return Dates
		.fromOperationalDate(operationalDate, 'Europe/Lisbon')
		.set({ hour: hoursOperation, minute: minutesOperation, second: secondsOperation })
		.unix_timestamp;

	//
};
