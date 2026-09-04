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
		throw new Error(`Plan ${planData._id} has no agency data associated for agency_id: ${planData.agency_id}`);
	}

	//
	// Return false if the agency does not have GTFS enabled

	if (!agencyData.open_data.services.gtfs_enabled) {
		Logger.info({ message: `Skip processing: Agency '${planData.agency_id}' does not have GTFS enabled.` });
		return false;
	}

	//
	// Return false if it does not have an associated operation file

	if (!planData.operation_file_id) {
		throw new Error(`Plan ${planData._id} has no operation file`);
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
