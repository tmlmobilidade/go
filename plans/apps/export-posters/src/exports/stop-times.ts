/* * */

import { type ExportToHitouchConfig } from '@/types.js';
import { CsvWriter } from '@helperkits/writer';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { type GTFS_StopTime } from '@tmlmobilidade/types';
import { Logs } from '@tmlmobilidade/utils';

/* * */

export function exportStopTimesFile(sqlTables: GtfsSQLTables, exportConfig: ExportToHitouchConfig) {
	//
	// Export calendar-related files

	const stopTimesCsv = new CsvWriter('stop_times.txt', `${exportConfig.workdir}/stop_times.txt`, { batch_size: 1000 });

	for (const stopTimeData of sqlTables.stop_times.all()) {
		const data: GTFS_StopTime = {
			arrival_time: stopTimeData.arrival_time,
			departure_time: stopTimeData.departure_time,
			drop_off_type: stopTimeData.drop_off_type,
			pickup_type: stopTimeData.pickup_type,
			shape_dist_traveled: stopTimeData.shape_dist_traveled,
			stop_headsign: stopTimeData.stop_headsign,
			stop_id: stopTimeData.stop_id,
			stop_sequence: stopTimeData.stop_sequence,
			timepoint: stopTimeData.timepoint,
			trip_id: stopTimeData.trip_id,
		};
		stopTimesCsv.write(data);
	}

	stopTimesCsv.flush();

	Logs.info('Exported stop_times.txt file.');
}
