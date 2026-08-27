/* * */

import { Dates } from '@tmlmobilidade/dates';
import { alerts } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const main = async () => {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	const nowTime = Dates.now('Europe/Lisbon').unix_timestamp;
	const alertsCollection = await alerts.getCollection();
	const scheduledAlerts = await alertsCollection.find(
		{
			$or: [
				{ publish_end_date: null },
				{ publish_end_date: { $gt: nowTime } },
			],
			publish_start_date: { $lte: nowTime },
			publish_status: 'scheduled',
		},
		{
			projection: { _id: 1 },
		},
	).toArray();

	if (scheduledAlerts.length === 0) {
		Logger.info({ message: 'No scheduled alerts found to update.' });
	}

	for (const alertData of scheduledAlerts) {
		await alerts.updateById(alertData._id, { ...alertData, publish_status: 'published' });

		Logger.info({
			message: `Alert ${alertData._id} publish status updated to published`,
		});
	};
	Logger.terminate(`Validation completed in ${globalTimer.get()}`);
};

await runOnInterval(main, { intervalMs: '5s' });
