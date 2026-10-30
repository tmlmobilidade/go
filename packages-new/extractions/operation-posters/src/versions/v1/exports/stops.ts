/* * */

import { GtfsStrictV30StopsSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { OperationPostersV1StopsSchema } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { buildStopCanvasTargets } from '../utils/build-stop-canvas-targets.js';
import { getCanvasLineFilter } from '../utils/get-canvas-line-filter.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportStopsFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, exportConfig: ExportHitouchConfig, routeIds: ReadonlyMap<string, string>) {
	//

	//
	// A. Validate and write stops referenced by stop times

	let exportedRows = 0;

	for (const row of sqlTables.stops.all('WHERE stop_id IN (SELECT DISTINCT stop_id FROM stop_times)')) {
		const stopData = GtfsStrictV30StopsSchema.parse(row);
		// SQLite returns null for absent optional fields; normalize them before validation.
		const data = OperationPostersV1StopsSchema.parse({
			location_type: stopData.location_type ?? '0',
			parent_station: stopData.parent_station ?? '',
			platform_code: stopData.platform_code ?? '',
			stop_code: stopData.stop_code,
			stop_id: stopData.stop_id,
			stop_lat: stopData.stop_lat,
			stop_lon: stopData.stop_lon,
			stop_name: stopData.stop_name,
			wheelchair_boarding: stopData.wheelchair_boarding ?? undefined,
		});
		await context.writers.stops.write(data);
		exportedRows++;
		await yieldToEventLoop(exportedRows);
	}

	await context.writers.stops.flush();

	Logger.info({ message: 'Exported stops.txt file.' });

	//
	// B. Skip stop poster targets for line-only exports

	if (exportConfig.content_mode === 'lines') {
		return Logger.info({ message: 'Skipped stopsToCanvasExt.txt file for line poster export.' });
	}

	//
	// C. Combine the selected line and stop filters

	const clauses: string[] = [];
	const parameters: string[] = [];

	if (exportConfig.content_mode === 'lines_stops') {
		const lineFilter = getCanvasLineFilter([...routeIds.keys()], exportConfig);
		clauses.push(lineFilter.clause);
		parameters.push(...lineFilter.parameters);
	}

	if ((exportConfig.content_mode === 'stops' || exportConfig.content_mode === 'lines_stops') && exportConfig.stop_ids.length) {
		const placeholders = exportConfig.stop_ids.map(() => '?').join(', ');
		clauses.push(`stop_times.stop_id ${exportConfig.stops_mode === 'exclude' ? 'NOT IN' : 'IN'} (${placeholders})`);
		parameters.push(...exportConfig.stop_ids);
	}

	//
	// D. Count stops per trip and choose one Canvas target per stop and direction

	const canvasFilter = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
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
	// E. Reject filters that leave no stop poster targets

	if (!targets.length) {
		if (exportConfig.content_mode === 'lines_stops') {
			throw new Error('The selected line and stop filters remove every stop poster target.');
		}
		if (exportConfig.content_mode === 'stops') {
			throw new Error('The selected stop filter removes every stop poster target.');
		}
		return Logger.info({ message: 'Skipped stopsToCanvasExt.txt file because no stop directions were found.' });
	}

	//
	// F. Write and flush stopsToCanvasExt.txt

	await context.writers.stops_to_canvas_ext.write(targets);
	await context.writers.stops_to_canvas_ext.flush();

	Logger.info({ message: 'Exported stopsToCanvasExt.txt file.' });
}
