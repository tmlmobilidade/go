/* eslint-disable perfectionist/sort-objects */
/* * */

import { getTypologyDetails } from '@/fetchers/typology.js';
import { type GtfsV29ExportConfig } from '@/types.js';
import { getLineType } from '@/utils.js';
import { Agency, GtfsTMLRoute, Line, pathTypeMapper, Pattern, Route, transportTypeMapper, Typology } from '@tmlmobilidade/types';

/* * */

/**
 * Parses route data into GTFS routes.txt format
 * @param agencyData - The agency data
 * @param lineData - The line data
 * @param routeData - The route data
 * @param typologyData - The typology data
 * @returns The formatted route row
 */
export function parseRoute(
	agencyData: Agency,
	lineData: Line,
	routeData: Route,
	typologyData: Typology,
	patternsData: Pattern[],
): GtfsTMLRoute {
	try {
		return {
			agency_id: agencyData._id,

			line_id: Number(lineData.code),
			line_short_name: lineData.code.replace(/  +/g, ' ').trim(),
			line_long_name: lineData.name.replaceAll(',', '').replace(/  +/g, ' ').trim(),
			line_type: getLineType(typologyData.code),

			route_id: routeData.code,
			route_short_name: lineData.code.replace(/  +/g, ' ').trim(),
			route_long_name: routeData.name.replaceAll(',', '').replace(/  +/g, ' ').trim(),
			route_type: transportTypeMapper.toGtfs(lineData.transport_type),
			route_color: typologyData.color.slice(1),
			route_text_color: typologyData.text_color.slice(1),
			route_origin: patternsData[0]?.origin || '',
			route_destination: patternsData[0]?.destination || '',

			circular: lineData.is_circular_line ? 1 : 0,
			school: lineData.is_school_line ? 1 : 0,
			path_type: pathTypeMapper.toGtfs(routeData.path_type),

		};
	} catch (error) {
		throw new Error(`Error parsing route ${routeData.code}: ${error}`);
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
	exportConfig: GtfsV29ExportConfig,
	typologiesMap?: Map<string, Typology>,
	patternsData?: Pattern[],
) {
	// Get typology details (from cache or fetch)
	const typologyData = await getTypologyDetails(lineData.typology, typologiesMap);
	if (!typologyData) {
		throw new Error(`Typology not found for line ${lineData.code}`);
	}

	const parsedRoute = parseRoute(agencyData, lineData, routeData, typologyData, patternsData || []);
	await exportConfig.writers.routes.write(parsedRoute);
}
