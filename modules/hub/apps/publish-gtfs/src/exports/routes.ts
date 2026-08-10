/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type ExportGtfsContext } from '@/types/context.js';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Route_Extended, type GTFS_RouteType } from '@tmlmobilidade/types';
import { getPublicLineId, getPublicRouteId } from '@tmlmobilidade/utils';

/* * */

export interface ExportedRoutesRow {
	agency_id: string
	line_id: string
	line_short_name: string
	line_long_name: string
	route_id: string
	route_short_name: string
	route_long_name: string
	route_type: GTFS_RouteType
	route_color: string
	route_text_color: string
	path_type: 1 | 2 | 3
	circular: 0 | 1
	school: 0 | 1
}

/**
 * Export the routes.txt file.
 * @param routesList The list of routes to export.
 * @param context The export context.
 */
export async function exportRoutesFile(routesList: GTFS_Route_Extended[], context: ExportGtfsContext) {
	//

	const timer = new Timer();

	Logger.info({ message: 'Exporting routes.txt file...' });

	const sortedRoutesList = routesList.sort((a, b) => a.route_id.localeCompare(b.route_id));

	for (const routeData of sortedRoutesList) {
		const parsedRouteRow: ExportedRoutesRow = {
			agency_id: routeData.agency_id,
			line_id: getPublicLineId(routeData.agency_id, String(routeData.line_id)),
			line_short_name: routeData.line_short_name,
			line_long_name: routeData.line_long_name,
			route_id: getPublicRouteId(routeData.agency_id, routeData.route_id),
			route_short_name: routeData.route_short_name,
			route_long_name: routeData.route_long_name,
			route_type: routeData.route_type,
			route_color: routeData.route_color,
			route_text_color: routeData.route_text_color,
			path_type: routeData.path_type,
			circular: routeData.circular,
			school: routeData.school,
		};
		await context.writers.routes.write(parsedRouteRow);
	}

	await context.writers.routes.flush();

	Logger.success(`Exported routes.txt file in ${timer.get()}.`);
}
