/* * */

import { encodeStopFlags } from '@tmlmobilidade/go-hub-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type HubGtfsExportStopsInput, HubGtfsExportStopsSchema } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { type ExportGtfsContext } from '../types/context.js';

/* * */

export async function exportStopsFile(context: ExportGtfsContext, agencyIds: string[]) {
	//

	const timer = new Timer();

	Logger.info({ message: 'Exporting stops.txt file...' });

	//
	// Build a map of location entities

	const allDistrictsData = await locationsProvider.findDistricts();
	const allDistrictsMap = new Map<string, string>(allDistrictsData.map(item => [item._id, item.name]));

	const allMunicipalitiesData = await locationsProvider.findMunicipalities();
	const allMunicipalitiesMap = new Map<string, string>(allMunicipalitiesData.map(item => [item._id, item.name]));

	const allParishesData = await locationsProvider.findParishes();
	const allParishesMap = new Map<string, string>(allParishesData.map(item => [item._id, item.name]));

	const allLocalitiesData = await locationsProvider.findLocalities();
	const allLocalitiesMap = new Map<string, string>(allLocalitiesData.map(item => [item._id, item.name]));

	//
	// Get all the stops for the specified agency IDs

	const allStopsData = await goDb.infrastructure.stops.findMany(
		{
			'flags.agency_ids': { $in: agencyIds },
			'is_deleted': false,
		},
		{ sort: { _id: 1 } },
	);

	//
	// Export the stops

	for (const stopData of allStopsData) {
		//

		//
		// Encode the stop flags to accomodate
		// multiple stop IDs for each agency

		const encodedStopFlags = encodeStopFlags(stopData.flags, agencyIds);

		//
		// Get the matching names for the stop's location entities

		const matchingDistrictName = allDistrictsMap.get(stopData.district_id);
		const matchingMunicipalityName = allMunicipalitiesMap.get(stopData.municipality_id);
		const matchingParishName = allParishesMap.get(stopData.parish_id);
		const matchingLocalityName = allLocalitiesMap.get(stopData.locality_id);

		const parsedStopsRow: HubGtfsExportStopsInput = {
			district_id: stopData.district_id,
			district_name: matchingDistrictName,
			flags: encodedStopFlags,
			legacy_ids: stopData.legacy_ids.join('|'),
			lifecycle_status: stopData.lifecycle_status,
			locality_id: stopData.locality_id ?? '-',
			locality_name: matchingLocalityName ?? '-',
			location_type: '0',
			municipality_id: stopData.municipality_id,
			municipality_name: matchingMunicipalityName,
			parish_id: stopData.parish_id ?? '-',
			parish_name: matchingParishName ?? '-',
			platform_code: '',
			stop_code: String(stopData._id),
			stop_id: String(stopData._id),
			stop_lat: stopData.latitude,
			stop_lon: stopData.longitude,
			stop_name: stopData.name,
			tts_stop_name: stopData.tts_name,
			wheelchair_boarding: '0',
		};

		const validatedStopsRow = HubGtfsExportStopsSchema.parse(parsedStopsRow);

		await context.writers.stops.write(validatedStopsRow);
	}

	await context.writers.stops.flush();

	Logger.success(`Exported stops.txt file in ${timer.get()}.`);
}
