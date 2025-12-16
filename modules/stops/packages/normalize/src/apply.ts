/* * */

import { getStopLocations } from '@/functions/get-stop-locations.js';
import { getStopShortName } from '@/functions/get-stop-short-name.js';
import { getStopTtsName } from '@/functions/get-stop-tts-name.js';
import { type Stop } from '@tmlmobilidade/types';

/**
 * Normalizes a stop by applying various normalization functions.
 * @param stopData The stop data object to normalize.
 * @returns The normalized stop data object.
 */
export async function normalizeStop(stopData: Stop): Promise<Stop> {
	//

	const updatedStopData = { ...stopData };

	//
	// Apply naming functions

	updatedStopData.short_name = getStopShortName(updatedStopData.name);
	updatedStopData.tts_name = getStopTtsName(updatedStopData.name);

	//
	// Apply location functions

	const stopLocations = await getStopLocations(updatedStopData.latitude, updatedStopData.longitude);
	updatedStopData.district_id = stopLocations.district_id;
	updatedStopData.locality_id = stopLocations.locality_id;
	updatedStopData.municipality_id = stopLocations.municipality_id;
	updatedStopData.parish_id = stopLocations.parish_id;

	//
	// Return the normalized stop data

	return updatedStopData;

	//
}
