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
	// Return false if it does not have an associated operation file

	if (!planData.operation_file_id) {
		throw new Error(`Plan ${planData._id} has no operation file`);
	}

	//
	// Return false if it does not have feed_info start and end dates

	if (!planData.gtfs_feed_info?.feed_start_date) {
		throw new Error(`Plan ${planData._id} has no feed_info start date`);
	}

	if (!planData.gtfs_feed_info?.feed_end_date) {
		throw new Error(`Plan ${planData._id} has no feed_info end date`);
	}

	//
	// Return false if the feed_start_date is after today

	const currentOperationalDate = Dates.now('Europe/Lisbon').operational_date_int;

	if (planData.gtfs_feed_info.feed_end_date < currentOperationalDate) {
		Logger.info({ message: `Skip processing: Plan is no longer active as feed_end_date '${planData.gtfs_feed_info.feed_end_date}' is before current date '${currentOperationalDate}'.` });
		return false;
	}

	//
	// Return true if all validations passed

	return true;

	//
}
