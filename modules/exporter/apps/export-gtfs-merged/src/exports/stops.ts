/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type MergedGtfsExportConfig } from '@/types.js';
// import { stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

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

interface StopObjApiResponse {
	district_id: string
	facilities: string[]
	id: string
	lat: number
	line_ids: string[]
	locality_id: string
	lon: number
	long_name: string
	municipality_id: string
	operational_status: string
	pattern_ids: string[]
	region_id: string
	route_ids: string[]
	short_name: string
	tts_name: string
	wheelchair_boarding: boolean
}

/* * */

export async function exportStopsFile(exportConfig: MergedGtfsExportConfig) {
	//

	// const allStopsList = await stops.findMany({}, { sort: { _id: 1 } });

	const allStopsRes = await fetch('https://api.carrismetropolitana.pt/v2/stops');
	const allStopsList = await allStopsRes.json() as StopObjApiResponse[];

	for await (const stopData of allStopsList) {
		const parsedStopsRow: ExportedStopsRow = {
			stop_id: stopData.id,
			stop_code: stopData.id,
			stop_name: stopData.long_name,
			tts_stop_name: stopData.tts_name ?? '',
			stop_lat: stopData.lat,
			stop_lon: stopData.lon,
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
