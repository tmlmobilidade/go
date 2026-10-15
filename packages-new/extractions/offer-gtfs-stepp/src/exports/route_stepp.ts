/* eslint-disable perfectionist/sort-objects */
/* * */

import { type GtfsSteppV1ExportConfig } from '@/types.js';
import { type GtfsStrictV30SteppRouteStepp } from '@tmlmobilidade/go-types-gtfs-strict';
import { type Line, type Pattern, type Route } from '@tmlmobilidade/go-types-offer';

/* * */

/** Exports a route's circular flag and a pattern's origin and destination to route_stepp.txt. */
export async function exportRouteStepp(lineData: Line, routeData: Route, patternData: Pattern, exportConfig: GtfsSteppV1ExportConfig) {
	const row: GtfsStrictV30SteppRouteStepp = {
		route_id: routeData.code,
		route_origin: patternData.origin,
		route_destination: patternData.destination,
		circular: lineData.is_circular_line ? '1' : '0',
	};

	await exportConfig.writers.route_stepp.write(row);
}
