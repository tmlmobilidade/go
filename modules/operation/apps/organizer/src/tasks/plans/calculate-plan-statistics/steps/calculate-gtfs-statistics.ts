/* * */

import { type PlanStatistics } from '@tmlmobilidade/go-types-operation';
import { type GtfsSQLTables } from '@tmlmobilidade/go-utils-import-gtfs';

import { calculateTripVkms } from './calculate-trip-vkms.js';
import { countLines } from './count-lines.js';
import { countTrips } from './count-trips.js';

/* * */

export type GtfsStatistics = Pick<PlanStatistics, 'line_count' | 'trip_count' | 'vkm_count'>;

/** Combines the GTFS totals while leaving the connection lifecycle to the caller. */
export function calculateGtfsStatistics(gtfs: GtfsSQLTables, startDate: number, endDate: number): GtfsStatistics {
	const tripCount = countTrips(gtfs);
	const lineCount = countLines(gtfs);
	const vkmCount = calculateTripVkms(gtfs, startDate, endDate)
		.reduce((total, trip) => total + trip.vkm, 0);

	return {
		line_count: lineCount,
		trip_count: tripCount,
		vkm_count: vkmCount,
	};
}
