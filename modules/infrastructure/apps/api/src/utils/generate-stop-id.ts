/* * */

import { deletedCmStops } from '@/lib/deleted-cm-stops.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type StopId, StopIdSchema } from '@tmlmobilidade/go-types-infrastructure';

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
		const randomId = Math.floor(Math.random() * 900_000) + 100_000;
		// Check if the generated Stop ID already exists
		const isExistingId = await goDb.infrastructure.stops.exists('_id', String(randomId));
		// Check if the generated Stop ID does not conflict with a legacy ID
		const isExistingLegacyId = await goDb.infrastructure.stops.exists('legacy_id', String(randomId));
		// Check if the generated Stop ID is not in the list of deleted CM Stops
		const isDeletedCmStop = deletedCmStops.some(deletedStop => deletedStop.stop_id === String(randomId));
		// Validate the structure of the generated Stop ID
		const isValidStructure = StopIdSchema.safeParse(randomId).success;
		// If the generated Stop ID does not exist, does not conflict with a legacy ID,
		// is not a deleted CM Stop, and has a valid structure, it is valid.
		isValid = !isExistingId && !isExistingLegacyId && !isDeletedCmStop && isValidStructure;
		// If the generated Stop ID is valid, set it as the new Stop ID
		if (isValid) newStopId = StopIdSchema.parse(randomId);
	}

	return newStopId;
}
