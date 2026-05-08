import type { Filter } from '@tmlmobilidade/interfaces';
import type { Ride } from '@tmlmobilidade/types';

import { AppConfig } from '@/lib/config.js';
import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

export function buildRidesQuery(): Filter<Ride> {
	const query: Filter<Ride> = {
		agency_id: { $in: AppConfig.agencyIds },
	};

	if (AppConfig.useDevLineIds) {
		query.line_id = { $in: AppConfig.devLineIds };
	}

	return query;
}

export async function fetchCurrentWindowRides(ridesQuery: Filter<Ride>) {
	Logger.progress(`Getting current window rides for date range: ${Dates.now('Europe/Lisbon').minus({ hours: 1 }).iso} → ${Dates.now('Europe/Lisbon').plus({ hours: 2 }).iso}`);

	const currentWindowRides = await rides.aggregate([
		{ $match: {
			...ridesQuery,
			start_time_scheduled: {
				$gte: Dates.now('Europe/Lisbon').minus({ hours: 1 }).unix_timestamp,
				$lte: Dates.now('Europe/Lisbon').plus({ hours: 1 }).unix_timestamp,
			},
		} },
		{ $sort: { start_time_scheduled: -1 } },
	]);

	Logger.progress(`Found ${currentWindowRides.length} current window rides`);
	return currentWindowRides;
}

export async function fetchHistoricalRidesForDayIndex(ridesQuery: Filter<Ride>, dayIndex: number) {
	const start = Dates.now('Europe/Lisbon').minus({ days: dayIndex, hours: 1 });
	const end = Dates.now('Europe/Lisbon').minus({ days: dayIndex }).plus({ hours: 2 });

	Logger.progress(`Getting historical rides for date range: ${start.iso} → ${end.iso}`);

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
