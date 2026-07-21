/* * */

import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { type Plan } from '@tmlmobilidade/types';

/* * */

export function validatePlan(planData: Plan): boolean {
	//

	//
	// Return false if the agency is not for the given IDs

	if (!['A2L1N', 'BNA17', 'LA77N', 'YA15B'].includes(planData.agency_id)) {
		Logger.error({ message: `Skip processing: gtfs_agency is '${planData.agency_id}'. Only 'LA77N', 'BNA17', 'YA15B', or 'A2L1N' are allowed.` });
		return false;
	}

	//
	// Return false if it does not have an associated operation file

	if (!planData.operation_file_id) {
		Logger.error({ message: `Skip processing: No operation file found.` });
		return false;
	}

	//
	// Return false if it does not have feed_info start and end dates

	if (!planData.gtfs_feed_info?.feed_start_date) {
		Logger.error({ message: `Skip processing: No feed_info start date.` });
		return false;
	}

	if (!planData.gtfs_feed_info?.feed_end_date) {
		Logger.error({ message: `Skip processing: No feed_info end date.` });
		return false;
	}

	//
	// Return false if the feed_start_date is after the feed_end_date

	const currentOperationalDate = Dates.now('Europe/Lisbon').operational_date;

	if (planData.gtfs_feed_info.feed_end_date < currentOperationalDate) {
		Logger.error({ message: `Skip processing: Plan is no longer active as feed_end_date '${planData.gtfs_feed_info.feed_end_date}' is before current operational date '${currentOperationalDate}'.` });
		return false;
	}

	//
	// Return true if all validations passed

	return true;

	//
}
