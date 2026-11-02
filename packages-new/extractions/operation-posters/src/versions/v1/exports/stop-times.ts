/* * */

import { GtfsStrictV30StopTimesSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { OperationPostersV1StopTimesSchema } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { type ExportHitouchConfig } from '../types/export-hitouch-config.js';
import { getCanvasLineFilter } from '../utils/get-canvas-line-filter.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportStopTimesFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables, exportConfig: ExportHitouchConfig) {
	//

	//
	// A. Export stop times for the same selected routes as trips.txt.
	// Use the final trip IDs from calendar processing.
	// Pattern annotations belong to shapesExt.txt.

	//
	// B. Prepare the stop times filter

	let exportedRows = 0;
	const { clause, parameters } = getCanvasLineFilter(sqlTables.trips.distinct('route_id'), exportConfig);
	const tripFilter = clause ? `WHERE trip_id IN (SELECT trip_id FROM trips WHERE ${clause})` : '';

	//
	// C. Export the stop times

	for (const row of sqlTables.stop_times.all(`${tripFilter} ORDER BY trip_id ASC, CAST(stop_sequence AS INTEGER) ASC`, parameters)) {
		const stopTimeData = GtfsStrictV30StopTimesSchema.parse(row);
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
	}

	//
	// D. Flush the stop times file

	await context.writers.stop_times.flush();

	Logger.info({ message: 'Exported stop_times.txt file.' });
}
