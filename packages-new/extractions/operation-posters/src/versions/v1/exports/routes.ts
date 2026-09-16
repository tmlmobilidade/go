/* * */

import { type GtfsStrictV30Routes } from '@tmlmobilidade/go-types-gtfs-strict';
import { OperationPostersV1RoutesSchema, type OperationPostersV1RoutesToCanvasExt } from '@tmlmobilidade/go-types-operation';
import { GtfsStrictV30SQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';

import { type OperationPostersV1Context } from '../types/context.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { getCanvasLineFilter } from '../utils/get-canvas-line-filter.js';
import { getPosterRouteId } from '../utils/get-poster-route-id.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportRoutesFile(context: OperationPostersV1Context, sqlTables: GtfsStrictV30SQLTables, exportConfig: ExportHitouchConfig): Promise<Map<string, string>> {
	//
	// Export routes.txt

	//
	// Keep one route per base ID, preferring the main (_0) route's metadata.
	// Sorting gives a stable fallback when a family has no _0 route.

	const mainRoutes = new Map<string, GtfsStrictV30Routes>();
	const routeIds = new Map<string, string>();

	for (const route of sqlTables.routes.all('ORDER BY route_id ASC')) {
		const routeId = getPosterRouteId(route.route_id);
		routeIds.set(route.route_id, routeId);
		if (!mainRoutes.has(routeId) || route.route_id === `${routeId}_0`) {
			mainRoutes.set(routeId, route);
		}
	}

	for (const [routeId, route] of mainRoutes) {
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
	// Export route canvas profiles by route and direction.

	const isLineExport = exportConfig.content_mode === 'lines' || exportConfig.content_mode === 'lines_stops';
	const { clause, parameters } = getCanvasLineFilter([...routeIds.keys()], exportConfig);
	const lineFilter = clause ? `WHERE ${clause}` : '';

	const routesToCanvasExtRows = sqlTables._db.databaseInstance.prepare(
		` SELECT DISTINCT trips.route_id, trips.direction_id
		FROM trips
		${lineFilter}
		ORDER BY trips.route_id ASC, trips.direction_id ASC `,
	).all(...parameters).map((row: { direction_id: number, route_id: string }): OperationPostersV1RoutesToCanvasExt => {
		const routeId = routeIds.get(row.route_id);
		if (!routeId) throw new Error(`Cannot export canvas target: route ${row.route_id} was not exported.`);
		return {
			canvas_profile: '08.01.RouteTimeTable.001',
			direction_id: row.direction_id,
			route_id: routeId,
		};
	});
	const uniqueRoutesToCanvasExtRows = Array.from(new Map(
		routesToCanvasExtRows.map(row => [JSON.stringify([row.route_id, row.direction_id]), row]),
	).values());

	//
	// If no route directions were found, skip the export

	if (!routesToCanvasExtRows.length) {
		if (isLineExport) {
			throw new Error('The selected line filter removes every route poster target.');
		}
		Logger.info({ message: 'Skipped routesToCanvasExt.txt file because no route directions were found.' });
		return routeIds;
	}

	//
	// Output the routes to canvas ext data

	await context.writers.routes_to_canvas_ext.write(uniqueRoutesToCanvasExtRows);
	await context.writers.routes_to_canvas_ext.flush();
	await yieldToEventLoop();

	Logger.info({ message: 'Exported routesToCanvasExt.txt file.' });

	return routeIds;
}
