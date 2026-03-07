/* * */

import { fares } from '@tmlmobilidade/interfaces';
import { Fare } from '@tmlmobilidade/types';

/* * */

/**
 * Fetches all fares and returns them as a Map keyed by ID
 * @returns A Map of fare ID to Fare object
 */
export async function fetchAllFares(): Promise<Map<string, Fare>> {
	try {
		const allFares = await fares.findMany({});
		const faresMap = new Map<string, Fare>();
		for (const fare of allFares) {
			faresMap.set(fare._id, fare);
		}
		return faresMap;
	}
	catch (error) {
		throw new Error(`Error fetching fares: ${error}`);
	}
}
