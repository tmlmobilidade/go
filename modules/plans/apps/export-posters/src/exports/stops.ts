/* * */

import { type ExportToHitouchConfig, type StopsToCanvasExt } from '@/types.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type GTFS_Stop } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import fs from 'node:fs';
import Papa from 'papaparse';

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

	//
	// Export stop canvas profiles by stop and direction.

	const stopsToCanvasExtFields: (keyof StopsToCanvasExt)[] = ['stop_id', 'canvas_profile', 'direction_id'];
	const stopsToCanvasExtRows = sqlTables._db.prepare(
		` SELECT DISTINCT stop_times.stop_id, trips.direction_id
		FROM stop_times
		INNER JOIN trips ON trips.trip_id = stop_times.trip_id
		ORDER BY stop_times.stop_id ASC, trips.direction_id ASC `,
	).all().map((row: { direction_id: number, stop_id: string }): StopsToCanvasExt => ({
		canvas_profile: '0Master.C',
		direction_id: row.direction_id,
		stop_id: row.stop_id,
	}));

	//
	// If no stop directions were found, skip the export

	if (!stopsToCanvasExtRows.length) return Logger.info({ message: 'Skipped stopsToCanvasExt.txt file because no stop directions were found.' });

	//
	// Output the stops to canvas ext data

	const stopsToCanvasExtCsvData = '\uFEFF' + Papa.unparse(
		{ data: stopsToCanvasExtRows, fields: stopsToCanvasExtFields },
		{
			newline: '\r\n',
			quotes: (value, columnIndex) => columnIndex === 0 && !stopsToCanvasExtFields.includes(value as keyof StopsToCanvasExt),
		},
	);

	//
	// Output the stops to canvas ext file

	fs.writeFileSync(`${exportConfig.workdir}/stopsToCanvasExt.txt`, stopsToCanvasExtCsvData, { encoding: 'utf-8', flush: true });

	Logger.info({ message: 'Exported stopsToCanvasExt.txt file.' });

	//
	// Flush the stops CSV file

	await stopsCsv.flush();

	Logger.info({ message: 'Exported stops.txt file.' });
}
