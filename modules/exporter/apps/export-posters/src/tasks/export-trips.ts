/* * */

import { type GtfsStrictV29ExtTrips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type GtfsStrictV29ExtSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { CsvWriter } from '@tmlmobilidade/writers';

import { type ExportToHitouchConfig } from '../types.js';

/* * */

type TripsFileRow = Pick<GtfsStrictV29ExtTrips, 'direction_id' | 'route_id' | 'service_id' | 'shape_id' | 'trip_headsign' | 'trip_id' | 'wheelchair_accessible'>;

/* * */

/**
 * Exports the trips.txt file.
 * @param sqlTables The imported GTFS SQL tables.
 * @param exportConfig The export configuration.
 */
export async function exportTripsFile(sqlTables: GtfsStrictV29ExtSQLTables, exportConfig: ExportToHitouchConfig) {
	//

	//
	// Export trips file

	const tripsCsv = new CsvWriter('trips.txt', `${exportConfig.workdir}/trips.txt`, { batch_size: 10000 });

	for await (const tripData of sqlTables.trips.stream('ORDER BY trip_id ASC')) {
		const data: TripsFileRow = {
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

	Logger.info({ message: 'Exported trips.txt file.' });

	//
}
