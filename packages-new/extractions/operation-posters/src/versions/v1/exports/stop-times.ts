/* * */

import { OperationPostersV1StopTimesSchema } from '@tmlmobilidade/go-types-operation';
import { GtfsStrictV30SQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';

import { type OperationPostersV1Context } from '../types/context.js';
import { buildVariantNotes } from '../utils/build-variant-notes.js';
import { yieldToEventLoop } from '../utils/yield-to-event-loop.js';

/* * */

export async function exportStopTimesFile(context: OperationPostersV1Context, sqlTables: GtfsStrictV30SQLTables) {
	//
	// Export stop times and annotations using the final trip IDs from calendar processing.

	const { tripNotes: variantNotes } = buildVariantNotes(sqlTables.trips.all());
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

		const annotation = variantNotes.get(stopTimeData.trip_id);
		if (!annotation) continue;
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
	Logger.info({ message: annotationsCount ? `Exported ${annotationsCount} variant annotations in stop_timesExt.txt.` : 'Skipped stop_timesExt.txt because no variant annotations were found.' });
}
