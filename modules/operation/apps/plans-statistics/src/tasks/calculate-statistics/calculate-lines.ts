/* * */

import { type GtfsSQLTables } from '@tmlmobilidade/go-utils-import-gtfs';

/* * */

/** Counts the distinct route_short_name values imported from routes.txt. */
export function calculateLines(gtfs: GtfsSQLTables): number {
	if (!gtfs.routes) {
		throw new Error('Cannot calculate lines: the GTFS routes table is missing.');
	}

	const [result] = gtfs.routes.query<{ line_count: number }>(
		'SELECT COUNT(DISTINCT route_short_name) AS line_count FROM routes',
	);

	return result.line_count;
}
