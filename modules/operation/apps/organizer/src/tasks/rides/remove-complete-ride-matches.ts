/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Remove all Ride Matches with a "complete" processing status.
 */
export async function removeCompleteRideMatches() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info({ message: `Starting removal of complete Ride Matches...` });

	await labDb.operation.rideMatches.delete('processing_status = \'complete\'');

	Logger.success(`Removed complete Ride Matches in ${timer.get()}.`);
}
