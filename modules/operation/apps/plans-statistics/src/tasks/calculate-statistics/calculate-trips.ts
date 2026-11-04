/* * */

import { type GtfsSQLTables } from '@tmlmobilidade/go-utils-import-gtfs';

/* * */

/** Counts imported trips without deduplication or expansion by service dates. */
export function calculateTrips(gtfs: GtfsSQLTables): number {
	// A missing table is unavailable data, not a valid count of zero.
	if (!gtfs.trips) {
		throw new Error('Cannot calculate trips: the GTFS trips table is missing.');
	}

	// The SQLite table size uses COUNT(*), without loading the trip records.
	return gtfs.trips.size;
}
