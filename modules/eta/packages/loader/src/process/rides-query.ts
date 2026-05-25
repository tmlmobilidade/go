import type { AppConfig } from '@/lib/config.js';
import type { Filter } from '@tmlmobilidade/interfaces';
import type { Ride } from '@tmlmobilidade/types';

import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

export function buildRidesQuery(config: AppConfig): Filter<Ride> {
	const query: Filter<Ride> = {
		agency_id: { $in: config.agencyIds },
	};

	if (config.development.isDevelopment) {
		query.line_id = { $in: config.development.lineIds };
	}

	return query;
}

export async function fetchCurrentWindowRides(ridesQuery: Filter<Ride>, config: AppConfig) {
	Logger.progress(`Getting current window rides for date range: ${Dates.now('Europe/Lisbon').minus({ hours: 1 }).iso} → ${Dates.now('Europe/Lisbon').plus({ hours: 1 }).iso}`);

	const currentWindowRides = await rides.aggregate([
		{ $match: {
			...ridesQuery,
			start_time_scheduled: {
				$gte: config.development.isDevelopment ? config.development.timeStart.unix_timestamp : Dates.now('Europe/Lisbon').minus({ hours: 1 }).unix_timestamp,
				$lte: config.development.isDevelopment ? config.development.timeEnd.unix_timestamp : Dates.now('Europe/Lisbon').plus({ hours: 1 }).unix_timestamp,
			},
		} },
		{ $sort: { start_time_scheduled: -1 } },
	]);

	Logger.progress(`Found ${currentWindowRides.length} current window rides`);
	return currentWindowRides;
}

export async function fetchHistoricalRidesForDayIndex(ridesQuery: Filter<Ride>, dayIndex: number, config: AppConfig) {
	const start = config.development.isDevelopment ? config.development.timeStart.minus({ days: dayIndex, hours: 1 }) : Dates.now('Europe/Lisbon').minus({ days: dayIndex, hours: 1 });
	const end = config.development.isDevelopment ? config.development.timeEnd.minus({ days: dayIndex }).plus({ hours: 2 }) : Dates.now('Europe/Lisbon').minus({ days: dayIndex }).plus({ hours: 2 });

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
