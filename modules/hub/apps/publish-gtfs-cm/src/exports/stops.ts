/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type MergedGtfsExportConfig } from '@/types.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
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

export async function exportStopsFile(exportConfig: MergedGtfsExportConfig) {
	//

	const allStopsList = await goDb.infrastructure.stops.findMany(
		{ 'flags.agency_ids': { $in: ['A2L1N', 'BNA17', 'LA77N', 'YA15B'] } }, // Only stops used by CM
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

		const matchingDistrictData = await goDb.locations.districts.findById(stopData.district_id, { projection: { '_id': 1, 'properties.name': 1 } });
		const matchingMunicipalityData = await goDb.locations.municipalities.findById(stopData.municipality_id, { projection: { '_id': 1, 'properties.name': 1 } });
		const matchingParishData = await goDb.locations.parishes.findById(stopData.parish_id, { projection: { '_id': 1, 'properties.name': 1 } });
		const matchingLocalityData = await goDb.locations.localities.findById(stopData.locality_id, { projection: { '_id': 1, 'properties.name': 1 } });

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

		await exportConfig.writers.stops.write(parsedStopsRow);
	}

	await exportConfig.writers.stops.flush();

	Logger.info({ message: 'Exported stops.txt file.' });
}
