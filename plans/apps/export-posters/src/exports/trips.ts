/* * */

import { type ExportToHitouchConfig } from '@/types.js';
import { CsvWriter } from '@helperkits/writer';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { type GTFS_Trip } from '@tmlmobilidade/types';
import { Logs } from '@tmlmobilidade/utils';

/* * */

export async function exportTripFile(sqlTables: GtfsSQLTables, exportConfig: ExportToHitouchConfig) {
	//
	// Export calendar-related files

	const tripsCsv = new CsvWriter('trips.txt', `${exportConfig.workdir}/trips.txt`, { batch_size: 100000 });

	for (const tripData of sqlTables.trips.all()) {
		const data: GTFS_Trip = {
			direction_id: tripData.direction_id,
			route_id: tripData.route_id,
			service_id: tripData.service_id,
			shape_id: tripData.shape_id,
			trip_headsign: tripData.trip_headsign,
			trip_id: tripData.trip_id,
			wheelchair_accessible: tripData.wheelchair_accessible,
		};
		await tripsCsv.write(data);
	}

	await tripsCsv.flush();

	Logs.info('Exported trip.txt file.');
}
