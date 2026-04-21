/* * */

import { organizeAlert } from '@tmlmobilidade/go-alerts-pckg-organize';
import { alerts } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const main = async () => {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Get all Alert documents from the database

	const allAlertsData = await alerts.findMany({}, { sort: { publish_start_date: -1 } });

	Logger.info(`Found ${allAlertsData.length} alerts.`);

	//
	// Loop through all alerts and request updated attributes for each document

	for (const [alertIndex, alertData] of allAlertsData.entries()) {
		try {
			//

			Logger.info(`[${allAlertsData.length - alertIndex}/${allAlertsData.length}] Processing Alert ${alertData._id}...`);

			const organizedAlertData = await organizeAlert(alertData);

			await alerts.updateById(alertData._id, organizedAlertData);

			//
		} catch (error) {
			Logger.error(`Error processing Alert ${alertData._id}:`, error);
		}
	}

	Logger.terminate(`Organization completed in ${globalTimer.get()}`);

	//
};

/* * */

await runOnInterval(main, { intervalMs: '5m' });
