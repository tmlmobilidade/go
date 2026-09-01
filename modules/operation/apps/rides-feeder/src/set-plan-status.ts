/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ProcessingStatus } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export async function setPlanStatus(planId: string, status: ProcessingStatus) {
	//

	const plansCollection = await goDb.operation.plans.getCollection();

	await plansCollection.updateOne(
		{ _id: { $eq: planId } },
		{
			$set: {
				'apps.controller.last_hash': null,
				'apps.controller.status': status,
				'apps.controller.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds,
			},
		},
	);
};
