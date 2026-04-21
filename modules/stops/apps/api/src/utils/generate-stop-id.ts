/* * */

import { deletedCmStops } from '@/lib/deleted-cm-stops.js';
import { stops } from '@tmlmobilidade/interfaces';
import { type StopId, validateStopIdStructure } from '@tmlmobilidade/types';

/**
 * Generates a new unique Stop ID that does not conflict
 * with existing IDs or deleted CM Stops.
 * @returns A new unique Stop ID
 */
export async function generateStopId(): Promise<StopId> {
	//

	let newStopId: StopId;

	//
	// Generate a new unique Stop ID that does not conflict
	// with existing IDs or deleted CM Stops.

	let isValid = false;

	while (!isValid) {
		// Generate a random Stop ID between 100000 and 999999
		newStopId = Math.floor(Math.random() * 900_000) + 100_000 as StopId;
		// Check if the generated Stop ID already exists
		const isExistingId = await stops.existsById(newStopId);
		// Check if the generated Stop ID does not conflict with a legacy ID
		const isExistingLegacyId = await stops.exists('legacy_id', String(newStopId));
		// Check if the generated Stop ID is not in the list of deleted CM Stops
		const isDeletedCmStop = deletedCmStops.some(deletedStop => deletedStop.stop_id === String(newStopId));
		// Validate the structure of the generated Stop ID
		const isValidStructure = validateStopIdStructure(newStopId) !== false;
		// If the generated Stop ID does not exist, does not conflict with a legacy ID,
		// is not a deleted CM Stop, and has a valid structure, it is valid.
		isValid = !isExistingId && !isExistingLegacyId && !isDeletedCmStop && isValidStructure;
	}

	return newStopId;
}
