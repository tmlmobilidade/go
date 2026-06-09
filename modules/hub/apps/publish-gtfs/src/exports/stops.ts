/* eslint-disable perfectionist/sort-objects */

import { type ExportGtfsContext } from '@/types/context.js';
import { districts, localities, municipalities, parishes, stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HubGtfsExportStops, HubGtfsExportStopsSchema } from '@tmlmobilidade/types';

/* * */

export async function exportStopsFile(agencyIds: string[], context: ExportGtfsContext) {
	//

	const timer = new Timer();

	Logger.info('Exporting stops.txt file...');

	//
	// Build a map of location entities

	const allDistrictsData = await districts.findMany({}, { projection: { _id: 1, name: 1 } });
	const allDistrictsMap = new Map<string, string>(allDistrictsData.map(item => [item._id, item.name]));

	const allMunicipalitiesData = await municipalities.findMany({}, { projection: { _id: 1, name: 1 } });
	const allMunicipalitiesMap = new Map<string, string>(allMunicipalitiesData.map(item => [item._id, item.name]));

	const allParishesData = await parishes.findMany({}, { projection: { _id: 1, name: 1 } });
	const allParishesMap = new Map<string, string>(allParishesData.map(item => [item._id, item.name]));

	const allLocalitiesData = await localities.findMany({}, { projection: { _id: 1, name: 1 } });
	const allLocalitiesMap = new Map<string, string>(allLocalitiesData.map(item => [item._id, item.name]));

	//
	// Get all the stops for the specified agency IDs

	const allStopsList = await stops.findMany(
		{ 'flags.agency_ids': { $in: agencyIds }, 'is_deleted': false },
		{ sort: { _id: 1 } },
	);

	for (const stopData of allStopsList) {
		//

		const matchingDistrictName = allDistrictsMap.get(stopData.district_id);
		const matchingMunicipalityName = allMunicipalitiesMap.get(stopData.municipality_id);
		const matchingParishName = allParishesMap.get(stopData.parish_id);
		const matchingLocalityName = allLocalitiesMap.get(stopData.locality_id);

		const parsedStopsRow: HubGtfsExportStops = {
			stop_id: stopData._id,
			stop_code: stopData._id,
			legacy_ids: stopData.legacy_ids.join('|'),
			stop_name: stopData.name,
			tts_stop_name: stopData.tts_name ?? '',
			municipality_id: stopData.municipality_id ?? '',
			municipality_name: matchingMunicipalityName ?? '',
			district_id: stopData.district_id ?? '',
			district_name: matchingDistrictName ?? '',
			parish_id: stopData.parish_id ?? '',
			parish_name: matchingParishName ?? '',
			locality_id: stopData.locality_id ?? '',
			locality_name: matchingLocalityName ?? '',
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
