/* eslint-disable perfectionist/sort-objects */
/* * */

import { type GtfsSteppV1ExportConfig } from '@/types.js';
import { type Agency } from '@tmlmobilidade/go-types-core';
import { type GtfsStrictV30SteppRouteStepp } from '@tmlmobilidade/go-types-gtfs-strict';
import { pathTypeMapper, type Pattern, type Route } from '@tmlmobilidade/go-types-offer';

/* * */

const CONTRACT_BY_AGENCY_CODE: Record<string, string> = {
	41: 'TML 24/2020',
	42: 'TML 25/2020',
	43: 'TML 26/2020',
	44: 'TML 27/2020',
};

/* * */

/** Exports the agency's contract, a route's circular flag and path type, and a pattern's origin and destination to routes_stepp.txt. */
export async function exportRouteStepp(agencyData: Agency, routeData: Route, patternData: Pattern, isCircular: boolean, exportConfig: GtfsSteppV1ExportConfig) {
	const row: GtfsStrictV30SteppRouteStepp = {
		route_id: routeData.code,
		route_origin: patternData.origin,
		route_destination: patternData.destination,
		circular: isCircular ? '1' : '0',
		path_type: pathTypeMapper.toGtfs(routeData.path_type),
		contract: CONTRACT_BY_AGENCY_CODE[agencyData.code] ?? '',
	};

	await exportConfig.writers.route_stepp.write(row);
}
