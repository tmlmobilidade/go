/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type HubGtfsExportStopsInput, HubGtfsExportStopsSchema } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';

import { type ExportGtfsContext } from '../types/context.js';

/* * */

export async function exportStopsFile(context: ExportGtfsContext, agencyIds: string[]) {
	//

	const allStopsList = await goDb.infrastructure.stops.findMany(
		{ 'flags.agency_ids': { $in: agencyIds } }, // Only stops used by CM
	);

	for (const stopData of allStopsList) {
		//

		const matchingFlagData = stopData.flags?.find((flag) => {
			const matches41 = flag.agency_ids.includes('LA77N');
			const matches42 = flag.agency_ids.includes('BNA17');
			const matches43 = flag.agency_ids.includes('YA15B');
			const matches44 = flag.agency_ids.includes('A2L1N');
			return matches41 || matches42 || matches43 || matches44;
		});

		const matchingDistrictData = await locationsProvider.findDistrictById(stopData.district_id);
		const matchingMunicipalityData = await locationsProvider.findMunicipalityById(stopData.municipality_id);
		const matchingParishData = await locationsProvider.findParishById(stopData.parish_id);
		const matchingLocalityData = await locationsProvider.findLocalityById(stopData.locality_id);

		const parsedStopsRow: HubGtfsExportStopsInput = {
			district_id: stopData.district_id ?? '',
			district_name: matchingDistrictData?.name ?? '',
			locality_id: stopData.locality_id ?? '',
			locality_name: matchingLocalityData?.name ?? '',
			location_type: 0,
			municipality_id: stopData.municipality_id ?? '',
			municipality_name: matchingMunicipalityData?.name ?? '',
			parent_station: '',
			parish_id: stopData.parish_id ?? '',
			parish_name: matchingParishData?.name ?? '',
			platform_code: '',
			stop_code: matchingFlagData?.stop_id ?? stopData._id,
			stop_id: matchingFlagData?.stop_id ?? stopData._id,
			stop_lat: stopData.latitude,
			stop_lon: stopData.longitude,
			stop_name: stopData.name,
			tts_stop_name: stopData.tts_name ?? '',
			wheelchair_boarding: 0,
		};

		const validatedStopsRow = HubGtfsExportStopsSchema.parse(parsedStopsRow);

		await context.writers.stops.write(validatedStopsRow);
	}

	await context.writers.stops.flush();

	Logger.info({ message: 'Exported stops.txt file.' });
}
