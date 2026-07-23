/* * */

import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { type Plan } from '@tmlmobilidade/types';

/* * */

export function validatePlan(planData: Plan): boolean {
	//

	//
	// Return false if the agency is not for the given IDs

	if (![
		'2IA2N9', // Metro de Lisboa
		'7NTB1', // Fertagus
		'A2L1N', // Alsa (CM)
		'A3H3M', // TCB
		'BNA17', // Rodoviária de Lisboa (CM)
		'HF16N', // MobiCascais
		'IA9T6', // Carris
		'KB1F6', // Metro Transportes do Sul
		'LA77N', // Viação Alvorada (CM)
		'LTP61', // Transtejo
		'N18KL', // Comboios de Portugal
		'YA15B', // TST (CM)
	].includes(planData.agency_id)) {
		Logger.error({ message: `Skip processing: gtfs_agency is '${planData.agency_id}'. Only '2IA2N9', '7NTB1', 'A2L1N', 'A3H3M', 'BNA17', 'HF16N', 'IA9T6', 'KB1F6', 'LA77N', 'LTP61', 'N18KL', or 'YA15B' are allowed.` });
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
