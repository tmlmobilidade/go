/* * */

import { locations } from '@tmlmobilidade/interfaces';
import { type Municipality } from '@tmlmobilidade/types';

/* * */

/**
 * Fetches all municipalities and returns them as a Map indexed by municipality ID
 * This allows for efficient lookups when processing stops
 * @returns Map of municipality ID to Municipality object
 */
export async function fetchAllMunicipalities(): Promise<Map<string, Municipality>> {
	try {
		const allMunicipalities = await locations.findMunicipalities({}, { projection: { _id: 1, properties: 1 } });

		const municipalityMap = new Map<string, Municipality>();

		for (const municipality of allMunicipalities) {
			municipalityMap.set(municipality._id, municipality);
		}

		return municipalityMap;
	}
	catch (error) {
		throw new Error(`Failed to fetch municipalities: ${error}`);
	}
}
