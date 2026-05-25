/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type ExportGtfsContext } from '@/types/context.js';
import { locations, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export interface ExportedStopsRow {
	stop_id: string
	stop_id_new: number
	stop_code: string
	stop_name: string
	tts_stop_name: string
	stop_lat: number
	stop_lon: number
	municipality_id: string
	municipality_name: string
	district_id: string
	district_name: string
	parish_id: string
	parish_name: string
	locality_id: string
	locality_name: string
	wheelchair_boarding: 0 | 1 | 2
	location_type: 0 | 1 | 2 | 3 | 4
	parent_station: ''
	platform_code: ''
}

/* * */

export async function exportStopsFile(context: ExportGtfsContext) {
	//

	const allStopsList = await stops.findMany(
		{ district_id: { $in: ['07', '11', '15'] } }, // Évora, Lisboa and Setúbal districts
		{ sort: { _id: 1 } },
	);

	for (const stopData of allStopsList) {
		//

		const matchingFlagData = stopData.flags?.find((flag) => {
			const matches41 = flag.agency_ids.includes('41');
			const matches42 = flag.agency_ids.includes('42');
			const matches43 = flag.agency_ids.includes('43');
			const matches44 = flag.agency_ids.includes('44');
			return matches41 || matches42 || matches43 || matches44;
		});

		const matchingDistrictData = await locations.findDistrictById(stopData.district_id);
		const matchingMunicipalityData = await locations.findMunicipalityById(stopData.municipality_id);
		const matchingParishData = await locations.findParishById(stopData.parish_id);
		const matchingLocalityData = await locations.findLocalityById(stopData.locality_id);

		const parsedStopsRow: ExportedStopsRow = {
			stop_id: matchingFlagData?.stop_id ?? String(stopData._id),
			stop_id_new: stopData._id,
			stop_code: matchingFlagData?.stop_id ?? String(stopData._id),
			stop_name: stopData.name,
			tts_stop_name: stopData.tts_name ?? '',
			municipality_id: stopData.municipality_id ?? '',
			municipality_name: matchingMunicipalityData?.name ?? '',
			district_id: stopData.district_id ?? '',
			district_name: matchingDistrictData?.name ?? '',
			parish_id: stopData.parish_id ?? '',
			parish_name: matchingParishData?.name ?? '',
			locality_id: stopData.locality_id ?? '',
			locality_name: matchingLocalityData?.name ?? '',
			stop_lat: stopData.latitude,
			stop_lon: stopData.longitude,
			wheelchair_boarding: 0,
			location_type: 0,
			parent_station: '',
			platform_code: '',
		};

		await context.writers.stops.write(parsedStopsRow);
	}

	await context.writers.stops.flush();

	Logger.info('Exported stops.txt file.');
}
