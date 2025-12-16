/* * */

import { getStopLocations } from '@/functions/get-stop-locations.js';
import { getStopShortName } from '@/functions/get-stop-short-name.js';
import { getStopTtsName } from '@/functions/get-stop-tts-name.js';
import { type Stop } from '@tmlmobilidade/types';

/**
 * Organizes a stop by applying various organization functions.
 * @param stopData The stop data object to organize.
 * @returns The organized stop data object.
 */
export async function organizeStop(stopData: Stop): Promise<Stop> {
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
	// Return the organized stop data

	return updatedStopData;

	//
}
