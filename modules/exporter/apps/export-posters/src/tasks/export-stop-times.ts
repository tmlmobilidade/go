/* * */

import { type GtfsStrictV29ExtStopTimes } from '@tmlmobilidade/go-types-gtfs-strict';
import { type GtfsStrictV29ExtSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { CsvWriter } from '@tmlmobilidade/writers';

import { type ExportToHitouchConfig } from '../types.js';

/* * */

/**
 * The columns of the exported stop_times.txt file.
 * The strict v29 ext stop_times table does not carry `stop_headsign`,
 * so the column is kept in the file but left empty.
 */
interface StopTimesFileRow extends Pick<GtfsStrictV29ExtStopTimes, 'arrival_time' | 'departure_time' | 'drop_off_type' | 'pickup_type' | 'shape_dist_traveled' | 'stop_id' | 'stop_sequence' | 'timepoint' | 'trip_id'> {
	stop_headsign?: string
}

/* * */

/**
 * Exports the stop_times.txt file.
 * @param sqlTables The imported GTFS SQL tables.
 * @param exportConfig The export configuration.
 */
export async function exportStopTimesFile(sqlTables: GtfsStrictV29ExtSQLTables, exportConfig: ExportToHitouchConfig) {
	//

	//
	// Export stop_times file

	const stopTimesCsv = new CsvWriter('stop_times.txt', `${exportConfig.workdir}/stop_times.txt`, { batch_size: 100000 });

	for await (const stopTimeData of sqlTables.stop_times.stream()) {
		const data: StopTimesFileRow = {
			arrival_time: stopTimeData.arrival_time,
			departure_time: stopTimeData.departure_time,
			drop_off_type: stopTimeData.drop_off_type,
			pickup_type: stopTimeData.pickup_type,
			shape_dist_traveled: stopTimeData.shape_dist_traveled,
			stop_headsign: undefined,
			stop_id: stopTimeData.stop_id,
			stop_sequence: stopTimeData.stop_sequence,
			timepoint: stopTimeData.timepoint,
			trip_id: stopTimeData.trip_id,
		};
		await stopTimesCsv.write(data);
	}

	await stopTimesCsv.flush();

	Logger.info({ message: 'Exported stop_times.txt file.' });

	//
}
