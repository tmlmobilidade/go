/* * */

import { type GtfsStrictV30Routes } from '@tmlmobilidade/go-types-gtfs-strict';
import { OperationPostersV1RoutesSchema, type OperationPostersV1RoutesToCanvasExt } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { getCanvasLineFilter } from '../utils/get-canvas-line-filter.js';
import { getPosterRouteId } from '../utils/get-poster-route-id.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportRoutesFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, exportConfig: ExportHitouchConfig): Promise<Map<string, string>> {
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
		const data = OperationPostersV1RoutesSchema.parse({
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

	//
	// C. Skip route poster targets when exporting stop schedules
	// All-content and stop exports use stopsToCanvasExt.txt instead.

	if (exportConfig.content_mode === 'all' || exportConfig.content_mode === 'stops') {
		Logger.info({ message: 'Skipped routesToCanvasExt.txt file for stop schedule export.' });
		return routeIds;
	}

	//
	// D. Select and deduplicate route targets by poster route and direction

	const { clause, parameters } = getCanvasLineFilter([...routeIds.keys()], exportConfig);
	const canvasFilter = clause ? `WHERE ${clause}` : '';

	const directions = sqlTables.trips.query<{ direction_id: number, route_id: string }>(
		` SELECT DISTINCT trips.route_id, trips.direction_id
		FROM trips
		${canvasFilter}
		ORDER BY trips.route_id ASC, trips.direction_id ASC `,
		parameters,
	);
	const targets = new Map<string, OperationPostersV1RoutesToCanvasExt>();
	for (const row of directions) {
		const routeId = routeIds.get(row.route_id);
		if (!routeId) throw new Error(`Cannot export canvas target: route ${row.route_id} was not exported.`);
		targets.set(JSON.stringify([routeId, row.direction_id]), {
			canvas_profile: '08.01.RouteTimeTable.001',
			direction_id: row.direction_id,
			route_id: routeId,
		});
	}

	if (!targets.size) {
		throw new Error('The selected line filter removes every route poster target.');
	}

	//
	// E. Write route targets, flush and yield to the event loop

	await context.writers.routes_to_canvas_ext.write([...targets.values()]);
	await context.writers.routes_to_canvas_ext.flush();
	await yieldToEventLoop();

	Logger.info({ message: 'Exported routesToCanvasExt.txt file.' });

	return routeIds;
}
