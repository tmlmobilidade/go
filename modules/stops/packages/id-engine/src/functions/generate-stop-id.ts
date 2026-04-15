/* * */

import { deletedCmStops } from '@/lib/deleted-cm-stops.js';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopId } from '@tmlmobilidade/types';
import { fetchData } from '@tmlmobilidade/utils';

/**
 * Returns a new, unique, previously unused Stop ID,
 * formatted according to the set rules.
 * @returns The new Stop ID.
 */
export async function generateStopId(): Promise<StopId> {
	//

	let newStopId: StopId;

	//
	// Fetch existing Stop IDs

	const { data: existingStopIds } = await fetchData<StopId[]>(API_ROUTES.stops.STOPS_IDS);

	//
	// Generate a new unique Stop ID that does not conflict
	// with existing IDs or deleted CM Stops.

	let isValid = false;

	while (!isValid) {
		// Generate a random Stop ID between 100000 and 999999
		newStopId = Math.floor(Math.random() * 900_000) + 100_000 as StopId;
		// Check if the generated Stop ID already exists
		const isExistingId = existingStopIds.includes(newStopId);
		// Check if the generated Stop ID is not in the list of deleted CM Stops
		const isDeletedCmStop = deletedCmStops.some(deletedStop => deletedStop.stop_id === String(newStopId));
		// If the generated Stop ID does not exist
		// and is not a deleted CM Stop, it is valid.
		isValid = !isExistingId && !isDeletedCmStop;
	}

	return newStopId;

	//
}
