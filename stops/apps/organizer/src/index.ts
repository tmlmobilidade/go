/* * */

import { type LocationsApiResponse } from '@/types';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { stops } from '@tmlmobilidade/interfaces';
import { getAppConfig } from '@tmlmobilidade/lib';
import { fetchData } from '@tmlmobilidade/utils';

/**
 * This script ensures Stop documents have up to date attributes concerning
 * Locations data (Districts, Municipalities, Parishes, Localities) and other
 * relevant metadata (Facilities, Equipments, etc.).
 */
async function cleanOldValidations() {
	//

	LOGGER.init();

	const globalTimer = new TIMETRACKER();

	//
	// Get all Stop documents from the database

	const allStopsData = await stops.all();

	LOGGER.info(`Found ${allStopsData.length} stops.`);

	//
	// Loop through all stops and request updated attributes for each document

	for (const stopData of allStopsData) {
		//

		//
		// Check that the stop has the required properties

		if (!stopData.latitude || !stopData.longitude) {
			LOGGER.error(`Stop ${stopData._id} does not have a latitude or longitude. Skipping.`);
			continue;
		}

		//
		// Fetch the relevant Location data for this coordinate pair

		const locationsApiUrl = `${getAppConfig('locations', 'frontend_url', 'production')}/api/locations/coordinates?lat=${stopData.latitude}&lon=${stopData.longitude}`;

		const { data: locationsData } = await fetchData<LocationsApiResponse>(locationsApiUrl);

		if (!locationsData) {
			LOGGER.error(`No locations data found for stop ${stopData._id}. Skipping.`);
			continue;
		}

		await stops.updateById(stopData._id, {
			district_id: locationsData.district?._id ?? null,
			locality_id: locationsData.locality?._id ?? null,
			municipality_id: locationsData.municipality?._id ?? null,
			parish_id: locationsData.parish?._id ?? null,
		});

		LOGGER.success(`Updated stop ${stopData._id}: District ${locationsData.district?._id ?? null} | Municipality ${locationsData.municipality?._id ?? null} | Parish ${locationsData.parish?._id ?? null} | Locality ${locationsData.locality?._id ?? null} ${locationsData.locality?.name ?? null}`);

		//
	}

	LOGGER.terminate(`Organization completed in ${globalTimer.get()}`);

	//
}

/* * */

(async function init() {
	const runOnInterval = async () => {
		await cleanOldValidations();
		setTimeout(runOnInterval, 60_000); // 60 seconds in milliseconds
	};
	runOnInterval();
})();
