/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function evaluatePlan(planData: Plan): Promise<boolean> {
	//

	//
	// Return false if the agency is not found

	const agencyData = await goDb.core.agencies.findById(planData.agency_id);

	if (!agencyData) {
		Logger.error({ message: `Skip processing: No agency data found for agency_id '${planData.agency_id}'.` });
		return false;
	}

	//
	// Return false if the agency does not have GTFS enabled

	if (!agencyData.open_data.gtfs_enabled) {
		Logger.error({ message: `Skip processing: Agency '${planData.agency_id}' does not have GTFS enabled.` });
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
	// Return false if the feed_start_date is after today

	const currentOperationalDate = Dates.now('Europe/Lisbon').operational_date_int;

	if (planData.gtfs_feed_info.feed_end_date < currentOperationalDate) {
		Logger.error({ message: `Skip processing: Plan is no longer active as feed_end_date '${planData.gtfs_feed_info.feed_end_date}' is before current date '${currentOperationalDate}'.` });
		return false;
	}

	//
	// Return true if all validations passed

	return true;

	//
}
