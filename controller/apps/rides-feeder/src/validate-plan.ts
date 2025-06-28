/* * */

import LOGGER from '@helperkits/logger';
import { type Plan, ProcessingStatus } from '@tmlmobilidade/types';

/* * */

export function validatePlan(planData: Plan): boolean {
	//

	//
	// Return false if its feeder status is other than 'waiting' or 'processing'

	if (planData.feeder_status !== ProcessingStatus.Waiting && planData.feeder_status !== ProcessingStatus.Processing) {
		LOGGER.error(`Skip processing: feeder_status is '${planData.feeder_status}'. Only 'waiting' or 'processing' plans will be processed.`);
		return false;
	}

	//
	// Return false if it is not yet approved

	if (!planData.is_approved) {
		LOGGER.error(`Skip processing: Plan is not approved.`);
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
