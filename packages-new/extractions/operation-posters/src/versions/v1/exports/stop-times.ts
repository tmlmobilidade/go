/* * */

import { OperationPostersV1StopTimesSchema } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { type OperationPostersV1Context, type OperationPostersV1Tables } from '../types/context.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportStopTimesFile(context: OperationPostersV1Context, sqlTables: OperationPostersV1Tables) {
	//
	// Export all stop times using the final trip IDs from calendar processing.
	// Pattern annotations belong to shapesExt.txt.

	let exportedRows = 0;

	for (const stopTimeData of sqlTables.stop_times.all('ORDER BY trip_id ASC, stop_sequence ASC')) {
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

	await context.writers.stop_times.flush();

	Logger.info({ message: 'Exported stop_times.txt file.' });
}
