/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Remove all Ride Opportunities with a "complete" processing status.
 */
export async function removeCompleteRideOpportunities() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info({ message: `Starting removal of complete Ride Opportunities...` });

	await labDb.operation.eventRideOpportunities.delete('processing_status = "complete"');

	Logger.success(`Removed complete Ride Opportunities in ${timer.get()}.`);
}
