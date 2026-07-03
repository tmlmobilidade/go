/* * */

import { Dates } from '@tmlmobilidade/dates';
import { Filter, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Ride } from '@tmlmobilidade/types';

/* * */

export async function fetchHistoricalRidesForDayIndex(ridesQuery: Filter<Ride>, dayIndex: number) {
	const start = Dates.now('Europe/Lisbon').minus({ days: dayIndex, hours: 1 });
	const end = Dates.now('Europe/Lisbon').minus({ days: dayIndex }).plus({ hours: 2 });

	Logger.progress({ message: `Getting historical rides for date range: ${start.iso} → ${end.iso}` });

	return await rides.aggregate([
		{ $match: {
			...ridesQuery,
			start_time_scheduled: {
				$gte: start.unix_timestamp,
				$lte: end.unix_timestamp,
			},
		} },
		{ $sort: { start_time_scheduled: 1 } },
	]);
}

