/* * */

import { type ExportToHitouchConfig } from '@/types.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type GTFS_Stop } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';

/* * */

export async function exportStopsFile(sqlTables: GtfsSQLTables, exportConfig: ExportToHitouchConfig) {
	//
	// Export calendar-related files

	const stopsCsv = new CsvWriter('stops.txt', `${exportConfig.workdir}/stops.txt`, { batch_size: 100000 });

	for await (const stopData of sqlTables.stops.stream()) {
		const data: GTFS_Stop = {
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
}
