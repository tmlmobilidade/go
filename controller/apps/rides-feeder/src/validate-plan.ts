/* * */

import LOGGER from '@helperkits/logger';
import { type Plan, ProcessingStatus } from '@tmlmobilidade/types';

/* * */

export function validatePlan(planData: Plan): boolean {
	//

	//
	// Return false if its status is other than 'waiting' or 'processing'

	if (planData.status_controller !== ProcessingStatus.Waiting && planData.status_controller !== ProcessingStatus.Processing) {
		LOGGER.error(`Skip processing: status_controller is '${planData.status_controller}'. Only 'waiting' or 'processing' plans will be processed.`);
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
