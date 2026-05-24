/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type MergedGtfsExportConfig } from '@/types.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type GTFS_StopTime, type Plan } from '@tmlmobilidade/types';

/* * */

export interface ExportedStopTimesRow {
	trip_id: string
	arrival_time: string
	departure_time: string
	stop_id: string
	stop_sequence: number
	pickup_type: 0 | 1 | 2 | 3
	drop_off_type: 0 | 1 | 2 | 3
	continuous_pickup: 0 | 1 | 2 | 3
	continuous_drop_off: 0 | 1 | 2 | 3
	shape_dist_traveled: number
	timepoint: 0 | 1
}

/* * */

export async function exportStopTimesRows(planData: Plan, sqlTables: GtfsSQLTables, exportConfig: MergedGtfsExportConfig) {
	//

	for await (const stopTimeItem of sqlTables.stop_times.stream('ORDER BY trip_id, stop_sequence ASC')) {
		const stopTimeData: GTFS_StopTime = stopTimeItem;
		const parsedStopTimesRow: ExportedStopTimesRow = {
			trip_id: `[${planData._id}]${stopTimeData.trip_id}`,
			arrival_time: stopTimeData.arrival_time,
			departure_time: stopTimeData.departure_time,
			stop_id: stopTimeData.stop_id,
			stop_sequence: stopTimeData.stop_sequence,
			pickup_type: stopTimeData.pickup_type ?? 0,
			drop_off_type: stopTimeData.drop_off_type ?? 0,
			continuous_pickup: stopTimeData.continuous_pickup ?? 0,
			continuous_drop_off: stopTimeData.continuous_drop_off ?? 0,
			shape_dist_traveled: stopTimeData.shape_dist_traveled ?? 0,
			timepoint: stopTimeData.timepoint ?? 0,
		};
		await exportConfig.writers.stop_times.write(parsedStopTimesRow);
	}

	await exportConfig.writers.stop_times.flush();

	Logger.info('Exported stop_times.txt file.');
}
