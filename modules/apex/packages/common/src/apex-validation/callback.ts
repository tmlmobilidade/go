/* * */

import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';

/* * */

export async function invalidateRides(data: SimplifiedApexValidation[]) {
	if (!data || data.length === 0) return;

	try {
		//

		const invalidationTimer = new Timer();

		//
		// Map the flushed data to the query that will be used to invalidate documents

		const updateRidesOps = data.map((writeOp) => {
			const standardWindowInterval = Dates.fromUnixTimestamp(writeOp.created_at).std_window;
			return {
				start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
				trip_id: writeOp.trip_id,
			};
		}).filter(item => !!item.trip_id);

		if (updateRidesOps.length === 0) return;

		//
		// Invalidate all documents that are affected

		const updateRidesResult = await rides.updateMany({ $or: updateRidesOps }, { system_status: 'waiting' }, { returnResults: false });

		Logger.info(`Flush [simplified_apex_validations]: Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides (${invalidationTimer.get()})`);

		//
	} catch (error) {
		Logger.error('Error in flushCallback', error);
	}
};
