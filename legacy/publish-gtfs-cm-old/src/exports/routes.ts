/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type MergedGtfsExportConfig } from '@/types.js';
import { GtfsBinary, type GtfsRouteType } from '@tmlmobilidade/go-types-gtfs';
import { type GtfsStrictV29PathType, type GtfsStrictV29Routes } from '@tmlmobilidade/go-types-gtfs-strict';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export interface ExportedRoutesRow {
	agency_id: string
	line_id: string
	line_short_name: string
	line_long_name: string
	route_id: string
	route_short_name: string
	route_long_name: string
	route_type: GtfsRouteType
	route_color: string
	route_text_color: string
	path_type: GtfsStrictV29PathType
	circular: GtfsBinary
	school: GtfsBinary
}

/* * */

export async function exportRoutesFile(routesList: GtfsStrictV29Routes[], exportConfig: MergedGtfsExportConfig) {
	//

	const sortedRoutesList = routesList.sort((a, b) => a.route_id.localeCompare(b.route_id));

	for (const routeData of sortedRoutesList) {
		const parsedRouteRow: ExportedRoutesRow = {
			agency_id: routeData.agency_id,
			line_id: routeData.line_id,
			line_short_name: routeData.line_short_name,
			line_long_name: routeData.line_long_name,
			route_id: routeData.route_id,
			route_short_name: routeData.route_short_name,
			route_long_name: routeData.route_long_name,
			route_type: routeData.route_type,
			route_color: routeData.route_color,
			route_text_color: routeData.route_text_color,
			path_type: routeData.path_type,
			circular: routeData.circular,
			school: routeData.school,
		};
		await exportConfig.writers.routes.write(parsedRouteRow);
	}

	await exportConfig.writers.routes.flush();

	Logger.info({ message: 'Exported routes.txt file.' });
}
