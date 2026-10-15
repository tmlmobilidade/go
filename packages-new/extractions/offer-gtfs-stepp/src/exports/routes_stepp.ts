/* eslint-disable perfectionist/sort-objects */
/* * */

import { type GtfsSteppV1ExportConfig } from '@/types.js';
import { type GtfsStrictV30SteppRouteStepp } from '@tmlmobilidade/go-types-gtfs-strict';
import { pathTypeMapper, type Pattern, type Route } from '@tmlmobilidade/go-types-offer';

/* * */

/** Exports a route's circular flag and path type and a pattern's origin and destination to routes.stepp.txt. */
export async function exportRouteStepp(routeData: Route, patternData: Pattern, isCircular: boolean, exportConfig: GtfsSteppV1ExportConfig) {
	const row: GtfsStrictV30SteppRouteStepp = {
		route_id: routeData.code,
		route_origin: patternData.origin,
		route_destination: patternData.destination,
		circular: isCircular ? '1' : '0',
		path_type: pathTypeMapper.toGtfs(routeData.path_type),
	};

	await exportConfig.writers.route_stepp.write(row);
}
