/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Delete all Event Ride Opportunities that are complete.
 */
export async function cleanupCompleteEventRideOpportunities() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info({ message: `Starting cleanup of complete Event Ride Opportunities...` });

	await labDb.operation.eventRideOpportunities.delete('processing_status = "complete"');

	Logger.success(`Complete Event Ride Opportunities cleanup complete. Deleted complete Event Ride Opportunities. (${timer.get()})`);
}
