/* * */

import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { buildStopCanvasTargets } from '../utils/build-stop-canvas-targets.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportStopsToCanvasExtFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, exportConfig: ExportHitouchConfig) {
	//

	//
	// A. Prepare the selected stop filter

	const parameters = exportConfig.content === 'stops' ? exportConfig.stop_ids : [];
	const placeholders = parameters.map(() => '?').join(', ');
	const canvasFilter = parameters.length ? `WHERE stop_times.stop_id ${exportConfig.filter_mode === 'exclude' ? 'NOT IN' : 'IN'} (${placeholders})` : '';

	//
	// B. Count stops per trip and choose one Canvas target per stop and direction

	const servingRoutes = sqlTables.stop_times.query<{ direction_id: number, route_id: string, stop_count: number, stop_id: string }>(
		` WITH trip_stop_counts AS (
			SELECT trip_id, COUNT(*) AS stop_count FROM stop_times GROUP BY trip_id
		)
		SELECT stop_times.stop_id, trips.direction_id, trips.route_id, MAX(trip_stop_counts.stop_count) AS stop_count
		FROM stop_times
		INNER JOIN trips ON trips.trip_id = stop_times.trip_id
		INNER JOIN trip_stop_counts ON trip_stop_counts.trip_id = trips.trip_id
		${canvasFilter}
		GROUP BY stop_times.stop_id, trips.direction_id, trips.route_id
		ORDER BY stop_times.stop_id ASC, trips.direction_id ASC `,
		parameters,
	);
	const targets = buildStopCanvasTargets(servingRoutes, exportConfig);

	//
	// C. Reject filters that leave no stop poster targets

	if (!targets.length) {
		if (exportConfig.content === 'stops') {
			throw new Error('The selected stop filter removes every stop poster target.');
		}
		return Logger.info({ message: 'Skipped stopsToCanvasExt.txt file because no stop directions were found.' });
	}

	//
	// D. Write stop targets

	let exportedRows = 0;

	for (const target of targets) {
		await context.writers.stops_to_canvas_ext.write(target);
		await yieldToEventLoop(++exportedRows);
	}

	//
	// E. Flush stopsToCanvasExt.txt

	await context.writers.stops_to_canvas_ext.flush();

	Logger.info({ message: 'Exported stopsToCanvasExt.txt file.' });
}
