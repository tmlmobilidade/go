/* * */

import { getAutoTextValue } from '@/utils/get-auto-text-value.js';
import { getPublishStatusValue } from '@/utils/get-publish-status-value.js';
import { alerts } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { AlertSchema } from '@tmlmobilidade/types';

/* * */

export async function ensureStructure() {
	//

	Logger.title('Starting alert structure organization...');

	const globalTimer = new Timer();

	//
	// Get all Alert documents from the database

	const alertsQty = await alerts.count();

	const alertsCollection = await alerts.getCollection();

	const allAlertsStream = alertsCollection
		.find({}, { sort: { publish_start_date: -1 } })
		.stream();

	Logger.info({ message: `Found ${alertsQty} alerts.` });

	//
	// Loop through all alerts and request updated attributes for each document

	let counter = alertsQty;

	for await (const alertData of allAlertsStream) {
		try {
			//

			Logger.info({ message: `[${counter}/${alertsQty}] Processing Alert ${alertData._id}...` });

			counter--;

			const updatedAlertData = { ...alertData };

			//
			// Get updated properties

			updatedAlertData.publish_status = getPublishStatusValue(alertData);

			updatedAlertData.auto_texts = getAutoTextValue(alertData);

			//
			// Attempt to parse the updated alert with Zod
			// to ensure it adheres to the Alert schema.

			const parseResult = AlertSchema.safeParse(updatedAlertData);

			if (!parseResult.success) {
				throw new Error(`Validation failed for updated alert data: ${parseResult.error.message}`);
			}

			//
			// Save the organized alert data

			await alerts.updateById(alertData._id, parseResult.data);

			//
		} catch (error) {
			Logger.error({ error, message: `Error processing Alert ${alertData._id}:` });
		}
	}

	Logger.success(`Finished organizing alert structure (${globalTimer.get()})`);

	//
};
