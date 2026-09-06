/* * */

import { type Plan } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function evaluatePlan(planData: Plan): Promise<boolean> {
	//

	//
	// Return false if the agency is not CM

	const cmAgencyIds = ['LA77N', 'BNA17', 'YA15B', 'A2L1N'];

	if (!cmAgencyIds.includes(planData.agency_id)) {
		Logger.info({ message: `Skip processing: Plan is not for CM agency.` });
		return false;
	}

	//
	// Return false if it does not have an associated operation GTFS normalized attachment

	if (!planData.attachments.operation_gtfs_normalized) {
		throw new Error(`Plan ${planData._id} has no operation GTFS normalized attachment`);
	}

	//
	// Return false if it does not have feed_info start and end dates

	if (!planData.active_from) {
		throw new Error(`Plan ${planData._id} has no active from date`);
	}

	if (!planData.active_until) {
		throw new Error(`Plan ${planData._id} has no active until date`);
	}

	//
	// Return false if the feed_start_date is after today

	const currentOperationalDate = Dates.now('Europe/Lisbon').operational_date_int;

	if (planData.active_until < currentOperationalDate) {
		Logger.info({ message: `Skip processing: Plan is no longer active as active until date '${planData.active_until}' is before current date '${currentOperationalDate}'.` });
		return false;
	}

	//
	// Return true if all validations passed

	return true;

	//
}
