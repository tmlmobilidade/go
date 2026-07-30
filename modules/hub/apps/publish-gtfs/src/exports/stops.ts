/* eslint-disable perfectionist/sort-objects */

import { type ExportGtfsContext } from '@/types/context.js';
import { clampCoordinate } from '@tmlmobilidade/geo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type HubGtfsExportStops, HubGtfsExportStopsSchema } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function exportStopsFile(agencyIds: string[], context: ExportGtfsContext) {
	//

	const timer = new Timer();

	Logger.info({ message: 'Exporting stops.txt file...' });

	//
	// Build a map of location entities

	const allDistrictsData = await goDb.locations.districts.findMany({}, { projection: { '_id': 1, 'properties.name': 1 } });
	const allDistrictsMap = new Map<string, string>(allDistrictsData.map(item => [item._id, item?.['properties']?.['name']]));

	const allMunicipalitiesData = await goDb.locations.municipalities.findMany({}, { projection: { '_id': 1, 'properties.name': 1 } });
	const allMunicipalitiesMap = new Map<string, string>(allMunicipalitiesData.map(item => [item._id, item?.['properties']?.['name']]));

	const allParishesData = await goDb.locations.parishes.findMany({}, { projection: { '_id': 1, 'properties.name': 1 } });
	const allParishesMap = new Map<string, string>(allParishesData.map(item => [item._id, item?.['properties']?.['name']]));

	const allLocalitiesData = await goDb.locations.localities.findMany({}, { projection: { '_id': 1, 'properties.name': 1 } });
	const allLocalitiesMap = new Map<string, string>(allLocalitiesData.map(item => [item._id, item?.['properties']?.['name']]));

	//
	// Get all the stops for the specified agency IDs

	const allStopsList = await goDb.infrastructure.stops.findMany(
		{ 'flags.agency_ids': { $in: agencyIds }, 'is_deleted': false },
		{ sort: { _id: 1 } },
	);

	//
	// Export the stops

	for (const stopData of allStopsList) {
		//

		//
		// Format the stop flags to accomodate multiple IDs for each agency

		const formattedStopFlagsValue: string[] = [];

		for (const flagData of stopData.flags) {
			for (const agencyId of flagData.agency_ids) {
				if (!agencyIds.includes(agencyId)) continue;
				formattedStopFlagsValue.push(`${agencyId}-${flagData.stop_id}`);
			}
		}

		//
		// Get the matching names for the stop's location entities

		const matchingDistrictName = allDistrictsMap.get(stopData.district_id);
		const matchingMunicipalityName = allMunicipalitiesMap.get(stopData.municipality_id);
		const matchingParishName = allParishesMap.get(stopData.parish_id);
		const matchingLocalityName = allLocalitiesMap.get(stopData.locality_id);

		const parsedStopsRow: HubGtfsExportStops = {
			stop_id: stopData._id,
			stop_code: stopData._id,
			flags: formattedStopFlagsValue.join('|'),
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
			stop_lat: clampCoordinate(stopData.latitude),
			stop_lon: clampCoordinate(stopData.longitude),
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
