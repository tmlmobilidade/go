/* * */

import { OperationPostersV1Stops } from '@tmlmobilidade/go-types-operation';
import { GtfsStrictV30SQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';

import { type OperationPostersV1Context } from '../types/context.js';
import { type ExportHitouchConfig } from '../types/ExportHitouchConfig.js';
import { type StopsToCanvasExt } from '../types/StopsToCanvasExt.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportStopsFile(context: OperationPostersV1Context, sqlTables: GtfsStrictV30SQLTables, exportConfig: ExportHitouchConfig) {
	//
	// Export stops.txt

	let exportedRows = 0;

	for (const stopData of sqlTables.stops.all('WHERE stop_id IN (SELECT DISTINCT stop_id FROM stop_times)')) {
		const data: OperationPostersV1Stops = {
			location_type: stopData.location_type,
			parent_station: stopData.parent_station,
			platform_code: stopData.platform_code,
			stop_code: stopData.stop_code,
			stop_id: stopData.stop_id,
			stop_lat: stopData.stop_lat,
			stop_lon: stopData.stop_lon,
			stop_name: stopData.stop_name,
			wheelchair_boarding: stopData.wheelchair_boarding,
		};
		await context.writers.stops.write(data);
		exportedRows++;
		await yieldToEventLoop(exportedRows);
	}

	await context.writers.stops.flush();

	Logger.info({ message: 'Exported stops.txt file.' });

	//
	// Export stop canvas profiles by stop and direction.

	const stopPlaceholders = exportConfig.stop_ids.map(() => '?').join(', ');
	const isStopExport = (exportConfig.content_mode === 'stops' || exportConfig.content_mode === 'lines_stops') && exportConfig.stop_ids.length > 0;
	const canvasFilter = isStopExport
		? `WHERE stop_times.stop_id ${exportConfig.stops_mode === 'exclude' ? 'NOT IN' : 'IN'} (${stopPlaceholders})`
		: '';
	const canvasFilterParameters = isStopExport ? exportConfig.stop_ids : [];

	const stopsToCanvasExtRows = sqlTables._db.databaseInstance.prepare(
		` SELECT DISTINCT stop_times.stop_id, trips.direction_id
		FROM stop_times
		INNER JOIN trips ON trips.trip_id = stop_times.trip_id
		${canvasFilter}
		ORDER BY stop_times.stop_id ASC, trips.direction_id ASC `,
	).all(...canvasFilterParameters).map((row: { direction_id: number, stop_id: string }): StopsToCanvasExt => ({
		canvas_profile: exportConfig.canvas_profile,
		direction_id: row.direction_id,
		stop_id: row.stop_id,
	}));

	//
	// If no stop directions were found, skip the export

	if (!stopsToCanvasExtRows.length) {
		if (exportConfig.content_mode === 'stops' || exportConfig.content_mode === 'lines_stops') {
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
