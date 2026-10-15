/* * */

import { OperationPostersV1StopTimesSchema } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { buildVariantNotes } from '../utils/build-variant-notes.js';
import { getCanvasLineFilter } from '../utils/get-canvas-line-filter.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportStopTimesFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, exportConfig: ExportHitouchConfig) {
	//
	// Export stop times and annotations using the final trip IDs from calendar processing.

	const routes = sqlTables.routes.all();
	const { tripNotes: variantNotes } = buildVariantNotes(sqlTables.trips.all(), routes);
	const { clause, parameters } = getCanvasLineFilter(routes.map(route => route.route_id), exportConfig);
	const filterClauses = clause ? [clause] : [];

	if ((exportConfig.content_mode === 'stops' || exportConfig.content_mode === 'lines_stops') && exportConfig.stop_ids.length) {
		const stopPlaceholders = exportConfig.stop_ids.map(() => '?').join(', ');
		filterClauses.push(`EXISTS (
			SELECT 1 FROM stop_times
			WHERE stop_times.trip_id = trips.trip_id
			AND stop_times.stop_id ${exportConfig.stops_mode === 'exclude' ? 'NOT IN' : 'IN'} (${stopPlaceholders})
		)`);
		parameters.push(...exportConfig.stop_ids);
	}

	// Select whole trips for annotations, keeping their original variant indexes.
	const selectedTripIds = filterClauses.length ? new Set(sqlTables._db.databaseInstance.prepare(
		`SELECT trips.trip_id FROM trips WHERE ${filterClauses.join(' AND ')}`,
	).all(...parameters).map((row: { trip_id: string }) => row.trip_id)) : undefined;

	let previousTripId: string | undefined;
	let routeStopSequence = 0;
	let annotationsCount = 0;
	let exportedRows = 0;

	for (const stopTimeData of sqlTables.stop_times.all('ORDER BY trip_id ASC, stop_sequence ASC')) {
		if (stopTimeData.trip_id !== previousTripId) {
			previousTripId = stopTimeData.trip_id;
			routeStopSequence = 0;
		}
		routeStopSequence++;
		const data = OperationPostersV1StopTimesSchema.parse({
			arrival_time: stopTimeData.arrival_time,
			departure_time: stopTimeData.departure_time,
			drop_off_type: stopTimeData.drop_off_type,
			pickup_type: stopTimeData.pickup_type,
			shape_dist_traveled: stopTimeData.shape_dist_traveled,
			stop_id: stopTimeData.stop_id,
			stop_sequence: stopTimeData.stop_sequence,
			timepoint: stopTimeData.timepoint,
			trip_id: stopTimeData.trip_id,
		});
		await context.writers.stop_times.write(data);
		exportedRows++;
		await yieldToEventLoop(exportedRows);

		if (selectedTripIds && !selectedTripIds.has(stopTimeData.trip_id)) continue;

		const annotation = variantNotes.get(stopTimeData.trip_id);
		if (!annotation?.index.trim() || !annotation.note.trim()) continue;

		//
		// Only export extension rows with a complete variant annotation.

		const extension = {
			stop_id: stopTimeData.stop_id,
			stop_sequence: stopTimeData.stop_sequence,
			trip_id: stopTimeData.trip_id,
			// Leave billboard selection/alignment to the canvas; this file adds annotations only.
			billboard_alignment_id: '',
			billboard_importance: '',
			index: annotation.index,
			note: annotation.note,
			route_stop_sequence: routeStopSequence,
		};
		await context.writers.stop_times_ext.write(extension);
		annotationsCount++;
	}

	await context.writers.stop_times.flush();
	await context.writers.stop_times_ext.flush();

	Logger.info({ message: 'Exported stop_times.txt file.' });
	Logger.info({ message: `Exported ${annotationsCount} rows in stop_timesExt.txt with variant annotations.` });
}
