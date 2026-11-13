/* * */

import { RoutesSchema } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { type GtfsStrictV30Routes } from '@tmlmobilidade/go-types-gtfs-strict';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { getPosterRouteId } from '../utils/get-poster-route-id.js';

/* * */

export async function exportRoutesFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables): Promise<Map<string, string>> {
	//

	//
	// A. Map source routes to poster routes and choose their metadata
	// Keep one route per base ID, preferring the main (_0) route's metadata.
	// Sorting gives a stable fallback when a family has no _0 route.

	const posterRoutes = new Map<string, GtfsStrictV30Routes>();
	const routeIds = new Map<string, string>();

	for (const route of sqlTables.routes.all('ORDER BY route_id ASC')) {
		const routeId = getPosterRouteId(route.route_id);
		routeIds.set(route.route_id, routeId);
		if (!posterRoutes.has(routeId) || route.route_id === `${routeId}_0`) {
			posterRoutes.set(routeId, route);
		}
	}

	//
	// B. Validate and write routes.txt

	for (const [routeId, route] of posterRoutes) {
		const data = RoutesSchema.parse({
			agency_id: route.agency_id,
			route_color: route.route_color,
			route_id: routeId,
			route_long_name: route.route_long_name,
			route_short_name: route.route_short_name,
			route_text_color: route.route_text_color,
			route_type: route.route_type,
		});
		await context.writers.routes.write(data);
	}

	await context.writers.routes.flush();

	Logger.info({ message: 'Exported routes.txt file.' });

	return routeIds;
}
