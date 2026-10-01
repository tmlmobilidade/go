/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type ProcessingStatus } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export async function setPlanStatus(planId: string, appName: keyof Plan['apps'], status: ProcessingStatus, hash?: string) {
	//

	const plansCollection = await goDb.operation.plans.getCollection();

	await plansCollection.updateOne({ _id: planId }, {
		$set: {
			[`apps.${appName}.last_hash`]: hash || null,
			[`apps.${appName}.status`]: status,
			[`apps.${appName}.timestamp`]: Dates.now('utc').unix_milliseconds,
		},
	});
};
