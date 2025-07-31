/* * */

import LOGGER from '@helperkits/logger';
import { type Plan } from '@tmlmobilidade/types';

/* * */

export function validatePlan(planData: Plan): boolean {
	//

	//
	// Return false if the agency is not for the given operators

	if (!['41', '42', '43', '44'].includes(planData.gtfs_agency?.agency_id)) {
		LOGGER.error(`Skip processing: gtfs_agency is '${planData.gtfs_agency?.agency_id}'. Only '41', '42', '43', or '44' are allowed.`);
		return false;
	}

	//
	// Return false if its status is other than 'waiting' or 'processing'

	if (planData.controller.status !== 'waiting' && planData.controller.status !== 'processing') {
		LOGGER.error(`Skip processing: status_controller is '${planData.controller.status}'. Only 'waiting' or 'processing' plans will be processed.`);
		return false;
	}

	//
	// Return false if it does not have an associated operation file

	if (!planData.operation_file_id) {
		LOGGER.error(`Skip processing: No operation file found.`);
		return false;
	}

	//
	// Return true if all validations passed

	return true;

	//
}
