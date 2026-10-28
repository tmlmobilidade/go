/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

export async function getActivePlans(agencyId: string, currentDate: OperationalDateInt): Promise<Plan[]> {
	const plans = await goDb.operation.plans.findMany({ agency_id: agencyId });

	return plans
		.filter(plan => plan.attachments.operation_gtfs_normalized && plan.active_from && plan.active_until && plan.active_until >= currentDate)
		.sort((a, b) => {
			const aIsCurrent = a.active_from <= currentDate;
			const bIsCurrent = b.active_from <= currentDate;
			return Number(bIsCurrent) - Number(aIsCurrent) || b.active_from - a.active_from || b.updated_at - a.updated_at || a._id.localeCompare(b._id);
		});
}
