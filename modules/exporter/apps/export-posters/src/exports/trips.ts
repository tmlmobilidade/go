/* * */

import { type ExportToHitouchConfig } from '@/types.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type GTFS_Trip } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';

/* * */

export async function exportTripsFile(sqlTables: GtfsSQLTables, exportConfig: ExportToHitouchConfig) {
	//
	// Export calendar-related files

	const tripsCsv = new CsvWriter('trips.txt', `${exportConfig.workdir}/trips.txt`, { batch_size: 10000 });

	for await (const tripData of sqlTables.trips.stream('ORDER BY trip_id ASC')) {
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

	Logger.info({ message: 'Exported trip.txt file.' });
}
