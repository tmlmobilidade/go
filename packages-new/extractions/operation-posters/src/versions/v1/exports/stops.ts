/* * */

import { OperationPostersV1StopsSchema, type OperationPostersV1StopToCanvasExt } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { getCanvasLineFilter } from '../utils/get-canvas-line-filter.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportStopsFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, exportConfig: ExportHitouchConfig, routeIds: ReadonlyMap<string, string>) {
	//
	// Export stops.txt

	let exportedRows = 0;

	for (const stopData of sqlTables.stops.all('WHERE stop_id IN (SELECT DISTINCT stop_id FROM stop_times)')) {
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
	// Export stop canvas profiles by stop and direction.
	// When lines are selected, scope the stops to those lines' trips as well.

	const isLineExport = exportConfig.content_mode === 'lines' || exportConfig.content_mode === 'lines_stops';
	const isStopExport = (exportConfig.content_mode === 'stops' || exportConfig.content_mode === 'lines_stops') && exportConfig.stop_ids.length > 0;

	const canvasFilterClauses: string[] = [];
	const canvasFilterParameters: string[] = [];

	if (isLineExport) {
		const { clause, parameters } = getCanvasLineFilter([...routeIds.keys()], exportConfig);
		canvasFilterClauses.push(clause);
		canvasFilterParameters.push(...parameters);
	}

	if (isStopExport) {
		const stopPlaceholders = exportConfig.stop_ids.map(() => '?').join(', ');
		canvasFilterClauses.push(`stop_times.stop_id ${exportConfig.stops_mode === 'exclude' ? 'NOT IN' : 'IN'} (${stopPlaceholders})`);
		canvasFilterParameters.push(...exportConfig.stop_ids);
	}

	const canvasFilter = canvasFilterClauses.length ? `WHERE ${canvasFilterClauses.join(' AND ')}` : '';

	const stopsToCanvasExtRows = sqlTables._db.databaseInstance.prepare(
		` SELECT DISTINCT stop_times.stop_id, trips.direction_id
		FROM stop_times
		INNER JOIN trips ON trips.trip_id = stop_times.trip_id
		${canvasFilter}
		ORDER BY stop_times.stop_id ASC, trips.direction_id ASC `,
	).all(...canvasFilterParameters).map((row: { direction_id: number, stop_id: string }): OperationPostersV1StopToCanvasExt => ({
		canvas_profile: exportConfig.canvas_profile,
		direction_id: row.direction_id,
		stop_id: row.stop_id,
	}));

	//
	// If no stop directions were found, skip the export

	if (!stopsToCanvasExtRows.length) {
		if (exportConfig.content_mode === 'lines_stops') {
			throw new Error('The selected line and stop filters remove every stop poster target.');
		}
		if (exportConfig.content_mode === 'lines') {
			throw new Error('The selected line filter removes every stop poster target.');
		}
		if (exportConfig.content_mode === 'stops') {
			throw new Error('The selected stop filter removes every stop poster target.');
		}
		return Logger.info({ message: 'Skipped stopsToCanvasExt.txt file because no stop directions were found.' });
	}

	//
	// Output the stops to canvas ext data

	await context.writers.stops_to_canvas_ext.write(stopsToCanvasExtRows);
	await context.writers.stops_to_canvas_ext.flush();

	Logger.info({ message: 'Exported stopsToCanvasExt.txt file.' });

	//
}
