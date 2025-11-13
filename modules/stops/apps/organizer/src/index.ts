/* * */

import { type LocationsApiResponse } from '@/types.js';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { fetchData } from '@tmlmobilidade/utils';

/**
 * This script ensures Stop documents have up to date attributes concerning
 * Locations data (Districts, Municipalities, Parishes, Localities) and other
 * relevant metadata (Facilities, Equipments, etc.).
 */
async function cleanOldValidations() {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Get all Stop documents from the database

	const allStopsData = await stops.all();

	Logger.info(`Found ${allStopsData.length} stops.`);

	//
	// Loop through all stops and request updated attributes for each document

	for (const [stopIndex, stopData] of allStopsData.entries()) {
		//

		//
		// Check that the stop has the required properties

		if (!stopData.latitude || !stopData.longitude) {
			Logger.error(`[${allStopsData.length - stopIndex}/${allStopsData.length}] Stop ${stopData._id} does not have a latitude or longitude. Skipping.`);
			continue;
		}

		//
		// Fetch the relevant Location data for this coordinate pair

		const locationsApiUrl = `${API_ROUTES.locations.LOCATIONS_COORDINATES}?lat=${stopData.latitude}&lon=${stopData.longitude}`;

		const { data: locationsData } = await fetchData<LocationsApiResponse>(locationsApiUrl);

		if (!locationsData) {
			Logger.error(`[${allStopsData.length - stopIndex}/${allStopsData.length}] No locations data found for stop ${stopData._id}. Skipping.`);
			continue;
		}

		await stops.updateById(stopData._id, {
			district_id: locationsData.district?._id ?? null,
			locality_id: locationsData.locality?._id ?? null,
			municipality_id: locationsData.municipality?._id ?? null,
			parish_id: locationsData.parish?._id ?? null,
		});

		Logger.success(`[${allStopsData.length - stopIndex}/${allStopsData.length}] Updated stop ${stopData._id}: District ${locationsData.district?._id ?? null} | Municipality ${locationsData.municipality?._id ?? null} | Parish ${locationsData.parish?._id ?? null} | Locality ${locationsData.locality?._id ?? null} ${locationsData.locality?.name ?? null}`);

		//
	}

	Logger.terminate(`Organization completed in ${globalTimer.get()}`);

	//
}

/* * */

(async function init() {
	const runOnInterval = async () => {
		await cleanOldValidations();
		setTimeout(runOnInterval, 300_000); // 5 minutes in milliseconds
	};
	runOnInterval();
})();
