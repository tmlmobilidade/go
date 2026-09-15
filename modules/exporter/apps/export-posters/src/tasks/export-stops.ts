/* * */

import { type GtfsStrictV29ExtStops } from '@tmlmobilidade/go-types-gtfs-strict';
import { type GtfsStrictV29ExtSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { CsvWriter } from '@tmlmobilidade/writers';

import { type ExportToHitouchConfig } from '../types.js';

/* * */

type StopsFileRow = Pick<GtfsStrictV29ExtStops, 'location_type' | 'parent_station' | 'platform_code' | 'stop_code' | 'stop_desc' | 'stop_id' | 'stop_lat' | 'stop_lon' | 'stop_name' | 'stop_timezone' | 'stop_url' | 'wheelchair_boarding'>;

/* * */

/**
 * Exports the stops.txt file.
 * @param sqlTables The imported GTFS SQL tables.
 * @param exportConfig The export configuration.
 */
export async function exportStopsFile(sqlTables: GtfsStrictV29ExtSQLTables, exportConfig: ExportToHitouchConfig) {
	//

	//
	// Export stops file

	const stopsCsv = new CsvWriter('stops.txt', `${exportConfig.workdir}/stops.txt`, { batch_size: 100000 });

	for await (const stopData of sqlTables.stops.stream()) {
		const data: StopsFileRow = {
			location_type: stopData.location_type,
			parent_station: stopData.parent_station,
			platform_code: stopData.platform_code,
			stop_code: stopData.stop_code,
			stop_desc: stopData.stop_desc,
			stop_id: stopData.stop_id,
			stop_lat: stopData.stop_lat,
			stop_lon: stopData.stop_lon,
			stop_name: stopData.stop_name,
			stop_timezone: stopData.stop_timezone,
			stop_url: stopData.stop_url,
			wheelchair_boarding: stopData.wheelchair_boarding,
		};
		await stopsCsv.write(data);
	}

	await stopsCsv.flush();

	Logger.info({ message: 'Exported stops.txt file.' });

	//
}
