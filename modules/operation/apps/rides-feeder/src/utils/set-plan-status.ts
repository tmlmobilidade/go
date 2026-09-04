/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ProcessingStatus } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export async function setPlanStatus(planId: string, status: ProcessingStatus, hash?: string) {
	//

	const plansCollection = await goDb.operation.plans.getCollection();

	await plansCollection.updateOne(
		{ _id: { $eq: planId } },
		{
			$set: {
				'apps.rides_feeder.last_hash': hash ?? null,
				'apps.rides_feeder.status': status,
				'apps.rides_feeder.timestamp': Dates.now('Europe/Lisbon').unix_milliseconds,
			},
		},
	);
};
