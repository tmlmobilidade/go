/* eslint-disable perfectionist/sort-objects */
/* * */

import { type GtfsSteppV1ExportConfig } from '@/types.js';
import { type Agency } from '@tmlmobilidade/go-types-core';
import { type GtfsStrictV30SteppRoutes } from '@tmlmobilidade/go-types-gtfs-strict';
import { Line, Route, transportTypeMapper } from '@tmlmobilidade/go-types-offer';

/* * */

/**
 * Parses route data into GTFS routes.txt format
 * @param agencyData - The agency data
 * @param lineData - The line data
 * @param routeData - The route data
 * @returns The formatted route row
 */
export function parseRoute(
	agencyData: Agency,
	lineData: Line,
	routeData: Route,
): GtfsStrictV30SteppRoutes {
	try {
		return {
			route_id: routeData.code,
			agency_id: agencyData.code,
			route_short_name: lineData.code.replace(/  +/g, ' ').trim(),
			route_long_name: routeData.name.replaceAll(',', '').replace(/  +/g, ' ').trim(),
			route_desc: '',
			route_type: transportTypeMapper.toGtfs(lineData.transport_type),
		};
	} catch (error) {
		throw new Error(`Error parsing route ${routeData.code}: ${error}`, error);
	}
}

/**
 * Exports a single route to routes.txt
 * @param agencyData - The agency data
 * @param lineData - The line data
 * @param routeData - The route data
 * @param exportConfig - The export configuration
 * @param typologiesMap - Optional pre-fetched map of typologies for performance
 */
export async function exportRoute(
	agencyData: Agency,
	lineData: Line,
	routeData: Route,
	exportConfig: GtfsSteppV1ExportConfig,
) {
	const parsedRoute = parseRoute(agencyData, lineData, routeData);
	await exportConfig.writers.routes.write(parsedRoute);
}
