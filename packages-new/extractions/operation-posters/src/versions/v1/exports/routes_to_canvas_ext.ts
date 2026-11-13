/* * */

import { type RoutesToCanvasExt } from '@tmlmobilidade/go-types-gtfs-hitouch';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { getCanvasLineFilter } from '../utils/get-canvas-line-filter.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportRoutesToCanvasExtFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, exportConfig: ExportHitouchConfig, routeIds: ReadonlyMap<string, string>) {
	//

	//
	// A. Skip route poster targets when exporting stop schedules
	// All-content and stop exports use stopsToCanvasExt.txt instead.

	if (exportConfig.content_mode === 'all' || exportConfig.content_mode === 'stops') {
		Logger.info({ message: 'Skipped routesToCanvasExt.txt file for stop schedule export.' });
		return;
	}

	//
	// B. Select and deduplicate route targets by poster route and direction

	const { clause, parameters } = getCanvasLineFilter([...routeIds.keys()], exportConfig);
	const canvasFilter = clause ? `WHERE ${clause}` : '';

	const directions = sqlTables.trips.query<{ direction_id: number, route_id: string }>(
		` SELECT DISTINCT trips.route_id, trips.direction_id
		FROM trips
		${canvasFilter}
		ORDER BY trips.route_id ASC, trips.direction_id ASC `,
		parameters,
	);
	const targets = new Map<string, RoutesToCanvasExt>();
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
	// C. Write route targets, flush and yield to the event loop

	await context.writers.routes_to_canvas_ext.write([...targets.values()]);
	await context.writers.routes_to_canvas_ext.flush();
	await yieldToEventLoop();

	Logger.info({ message: 'Exported routesToCanvasExt.txt file.' });
}
