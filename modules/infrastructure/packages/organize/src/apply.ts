/* * */

import { getStopShortName } from '@/functions/get-stop-short-name.js';
import { getStopTtsName } from '@/functions/get-stop-tts-name.js';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';

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
	// Return the organized stop data

	return updatedStopData;

	//
}
