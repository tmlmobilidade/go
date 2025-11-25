/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type MergedGtfsExportConfig } from '@/types.js';
// import { stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Stop } from '@tmlmobilidade/types';

/* * */

interface ExportedStopsRow {
	stop_id: string
	stop_code: string
	stop_name: string
	tts_stop_name: string
	stop_lat: number
	stop_lon: number
	wheelchair_boarding: 0 | 1 | 2
	location_type: 0 | 1 | 2 | 3 | 4
	parent_station: ''
	platform_code: ''
}

/* * */

export async function exportStopsFile(exportConfig: MergedGtfsExportConfig) {
	//

	// const allStopsList = await stops.findMany({}, { sort: { _id: 1 } });

	const allStopsRes = await fetch('https://api.carrismetropolitana.pt/v2/stops');
	const allStopsList = await allStopsRes.json() as Stop[];

	for await (const stopData of allStopsList) {
		const parsedStopsRow: ExportedStopsRow = {
			stop_id: stopData._id,
			stop_code: stopData._id,
			stop_name: stopData.name,
			tts_stop_name: stopData.tts_name ?? '',
			stop_lat: stopData.latitude,
			stop_lon: stopData.longitude,
			wheelchair_boarding: 0,
			location_type: 0,
			parent_station: '',
			platform_code: '',
		};
		await exportConfig.writers.stops.write(parsedStopsRow);
	}

	await exportConfig.writers.stops.flush();

	Logger.info('Exported stops.txt file.');
}
