/* * */

import type { AppConfig } from '@/lib/config.js';
import type { Filter } from '@tmlmobilidade/interfaces';
import type { HashedPatternWaypoint, Ride } from '@tmlmobilidade/types';

import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export type HistoricalRide = Ride & { first_stop: HashedPatternWaypoint, last_stop: HashedPatternWaypoint };

/* * */

/**
 * Constructs a rides query filter based on application configuration.
 * - Always filters by agency IDs.
 * - Adds line_id filter if in development mode.
 */
export function buildRidesQuery(config: AppConfig): Filter<Ride> {
	const filter: Filter<Ride> = {
		agency_id: { $in: config.agencyIds },
	};

	if (config.development.isDevelopment && config.development.lineIds?.length) {
		filter.line_id = { $in: config.development.lineIds };
	}

	return filter;
}

/**
 * Fetches rides from the database that are scheduled to start within a
 * "current window" around the present time, or a development-specified
 * range when in development mode. The window is from 1 hour before to 1 hour
 * after the present time, unless overridden in development config.
 *
 * @param ridesQuery - Query filter for selecting rides (typically includes agency/line filters)
 * @param config - Application configuration including environment and time range
 * @returns Promise resolving to an array of Ride objects in the current window
 */
export async function fetchCurrentWindowRides(ridesQuery: Filter<Ride>, config: AppConfig) {
	Logger.progress({ message: `Getting current window rides for date range: ${Dates.now('Europe/Lisbon').minus({ hours: 1 }).iso} → ${Dates.now('Europe/Lisbon').plus({ hours: 1 }).iso}` });

	const currentWindowRides = await rides.aggregate([
		{
			$match: {
				...ridesQuery,
				start_time_scheduled: {
					$gte: config.development.isDevelopment
						? config.development.timeStart.unix_timestamp
						: Dates.now('Europe/Lisbon').minus({ hours: 1 }).unix_timestamp,
					$lte: config.development.isDevelopment
						? config.development.timeEnd.unix_timestamp
						: Dates.now('Europe/Lisbon').plus({ hours: 1 }).unix_timestamp,
				},
			},
		},
		{ $sort: { start_time_scheduled: -1 } },
	]);

	Logger.progress({ message: `Found ${currentWindowRides.length} current window rides` });
	return currentWindowRides;
}

/**
 * Fetches historical rides from the database for a specific "day index" relative to the current date,
 * or, in development mode, relative to the specified start and end times in the development config.
 *
 * The function returns rides whose scheduled start times fall within a computed window:
 *   - In production: from one hour before to two hours after the midnight of `dayIndex` days ago (from now in Europe/Lisbon timezone).
 *   - In development: similar window, but offset from the provided development timeStart/timeEnd, minus dayIndex days.
 *
 * The result includes projected ride fields and looks up the first and last stop of the associated hashed pattern.
 *
 * @param ridesQuery - The query filter for selecting rides (usually by agency/line).
 * @param dayIndex - Number of days in the past (0 = today, 1 = yesterday, ...).
 * @param config - AppConfig including environment and development setup.
 * @returns Promise resolving to an array of Ride objects for the historical window day.
 */
export async function fetchHistoricalRidesForDayIndex(ridesQuery: Filter<Ride>, dayIndex: number, config: AppConfig): Promise<HistoricalRide[]> {
	//

	//
	// Calculate the start and end times for the historical window.
	const start = config.development.isDevelopment
		? config.development.timeStart.minus({ days: dayIndex, hours: 1 })
		: Dates.now('Europe/Lisbon').minus({ days: dayIndex, hours: 1 });

	Logger.progress({ message: `Getting historical rides for date range: ${start.iso} → ${end.iso}` });

	return await rides.aggregate([
		// Match the rides that are within the historical window.
		{
			$match: {
				...ridesQuery,
				start_time_scheduled: { $gte: start.unix_timestamp, $lte: end.unix_timestamp },
			},
		},
		// Sort the rides by start time scheduled.
		{ $sort: { start_time_scheduled: 1 } },
		// Project only a subset of the ride fields.
		{
			$project: {
				_id: 1,
				agency_id: 1,
				end_time_observed: 1,
				hashed_pattern_id: 1,
				hashed_shape_id: 1,
				hashed_trip_id: 1,
				plan_id: 1,
				start_time_observed: 1,
				start_time_scheduled: 1,
				trip_id: 1,
			},
		},
		// Lookup the first and last stop of the associated hashed pattern.
		{
			$lookup: {
				as: 'pattern',
				from: 'hashed_patterns',
				let: { patternId: '$hashed_pattern_id' },
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$_id', '$$patternId'] },
						},
					},
					{
						$project: {
							_id: 0,
							first_stop: { $arrayElemAt: ['$path', 0] },
							last_stop: { $arrayElemAt: ['$path', { $subtract: [{ $size: '$path' }, 1] }] },
						},
					},
				],
			},
		},
		{
			$set: {
				first_stop: { $arrayElemAt: ['$pattern.first_stop', 0] },
				last_stop: { $arrayElemAt: ['$pattern.last_stop', 0] },
			},
		},
		// Hides the pattern, analysis and hashed_pattern fields.
		{
			$unset: ['pattern', 'analysis', 'hashed_pattern'],
		},
	]) as unknown as HistoricalRide[];
}
