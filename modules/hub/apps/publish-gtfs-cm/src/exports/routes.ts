/* * */

import { getQualifiedRouteId } from '@tmlmobilidade/go-hub-pckg-utils';
import { type GtfsRoutes } from '@tmlmobilidade/go-types-gtfs';
import { type HubGtfsExportRoutesInput, HubGtfsExportRoutesSchema } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { type ExportGtfsContext } from '../types/context.js';

/**
 * Export the routes.txt file.
 * @param context The export context.
 * @param routesList The list of routes to export.
 */
export async function exportRoutesFile(context: ExportGtfsContext, routesList: GtfsRoutes[]) {
	//

	const timer = new Timer();

	Logger.info({ message: 'Exporting routes.txt file...' });

	const sortedRoutesList = routesList.sort((a, b) => a.route_id.localeCompare(b.route_id));

	for (const routeData of sortedRoutesList) {
		const parsedRouteRow: HubGtfsExportRoutesInput = {
			agency_id: routeData.agency_id,
			cemv_support: routeData.cemv_support,
			continuous_drop_off: routeData.continuous_drop_off,
			continuous_pickup: routeData.continuous_pickup,
			route_color: routeData.route_color,
			route_id: getQualifiedRouteId(routeData.agency_id, routeData.route_id),
			route_long_name: routeData.route_long_name,
			route_short_name: routeData.route_short_name,
			route_text_color: routeData.route_text_color,
			route_type: routeData.route_type,
		};
		const validatedRouteRow = HubGtfsExportRoutesSchema.parse(parsedRouteRow);
		await context.writers.routes.write(validatedRouteRow);
	}

	await context.writers.routes.flush();

	Logger.success(`Exported routes.txt file in ${timer.get()}.`);
}
