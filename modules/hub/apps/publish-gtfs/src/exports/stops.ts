/* eslint-disable perfectionist/sort-objects */

import { type ExportGtfsContext } from '@/types/context.js';
import { locations, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HubGtfsExportStops, HubGtfsExportStopsSchema } from '@tmlmobilidade/types';

/* * */

export async function exportStopsFile(agencyIds: string[], context: ExportGtfsContext) {
	//

	const timer = new Timer();

	Logger.info('Exporting stops.txt file...');

	const allStopsList = await stops.findMany(
		{ 'flags.agency_ids': { $in: agencyIds } },
		{ sort: { _id: 1 } },
	);

	for (const stopData of allStopsList) {
		//

		const matchingDistrictData = await locations.findDistrictById(stopData.district_id);
		const matchingMunicipalityData = await locations.findMunicipalityById(stopData.municipality_id);
		const matchingParishData = await locations.findParishById(stopData.parish_id);
		const matchingLocalityData = await locations.findLocalityById(stopData.locality_id);

		const parsedStopsRow: HubGtfsExportStops = {
			stop_id: stopData._id,
			stop_code: stopData._id,
			legacy_ids: stopData.legacy_ids.join('|'),
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
			wheelchair_boarding: '0',
			location_type: '0',
			parent_station: '',
			platform_code: '',
		};

		const validatedStopsRow = HubGtfsExportStopsSchema.parse(parsedStopsRow);

		await context.writers.stops.write(validatedStopsRow);
	}

	await context.writers.stops.flush();

	Logger.success(`Exported stops.txt file in ${timer.get()}.`);
}
