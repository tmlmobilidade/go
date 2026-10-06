/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Returns eligible plans belonging to the organization's agencies.
 * @param agencyIds The organization's agency IDs.
 */
export async function getActivePlans(agencyIds: string[]): Promise<Plan[]> {
	//

	if (!agencyIds.length) return [];

	const plans = await goDb.operation.plans.findMany({ agency_id: { $in: agencyIds } });
	const currentOperationalDate = Dates.now('Europe/Lisbon').operational_date_int;

	return plans.filter((plan) => {
		if (!plan.attachments.operation_gtfs_normalized) return false;
		if (!plan.active_from || !plan.active_until) return false;
		return plan.active_until >= currentOperationalDate;
	});
}
