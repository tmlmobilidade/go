/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ProcessingStatus } from '@tmlmobilidade/go-types-shared';

/* * */

export async function setPlanStatus(planId: string, status: ProcessingStatus) {
	//

	const plansCollection = await goDb.operation.plans.getCollection();

	await plansCollection.updateOne(
		{ _id: { $eq: planId } },
		{ $set: { 'apps.controller.status': status } },
	);
};
