/* * */

import { Logger } from '@tmlmobilidade/logger';
import { type Plan } from '@tmlmobilidade/types';

/* * */

export function validatePlan(planData: Plan): boolean {
	//

	//
	// Return false if the agency is not for the given IDs

	if (!['41', '42', '43', '44'].includes(planData.gtfs_agency?.agency_id)) {
		Logger.error(`Skip processing: gtfs_agency is '${planData.gtfs_agency?.agency_id}'. Only '41', '42', '43', or '44' are allowed.`);
		return false;
	}

	//
	// Return false if the hash is the same,
	// as it means the plan did not change since last run

	if (planData.hash === planData.apps?.controller?.last_hash) {
		Logger.error(`Skip processing: Hash is the same as last_hash.`);
		return false;
	}

	//
	// Return false if its status is 'error'

	if (planData.apps?.controller?.status === 'error') {
		Logger.error(`Skip processing: status_controller is 'error'.`);
		return false;
	}

	//
	// Return false if it does not have an associated operation file

	if (!planData.operation_file_id) {
		Logger.error(`Skip processing: No operation file found.`);
		return false;
	}

	//
	// Return true if all validations passed

	return true;

	//
}
