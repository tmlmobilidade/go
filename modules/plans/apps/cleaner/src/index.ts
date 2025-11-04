/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { files, gtfsValidations } from '@tmlmobilidade/go-interfaces';
import { type GtfsValidation, type UnixTimestamp } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/**
 * This script removes gtfs-validation documents and their associated files
 * that are older than a given threshold (30 days). Depending on the status of the validation,
 * it will delete the associated files and the validation document itself.
 */
async function cleanOldValidations() {
	//

	LOGGER.init();

	const globalTimer = new TIMETRACKER();

	//
	// Get all GTFS Validation documents from the database

	const allValidations = await gtfsValidations.all();

	LOGGER.info(`Found ${allValidations.length} validations.`);

	//
	// Set the threshold for deletion (30 days)

	const thresholdsByStatus: Record<GtfsValidation['feeder_status'], number> = {

		complete: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds

		error: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds

		processing: 1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds

		waiting: 1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds

	};

	//
	// Loop through all validations and filter out, for each status,
	// those that are older than the threshold

	for (const validation of allValidations) {
		//

		//
		// Check that the validation has the required properties

		if (!validation.file_id) {
			LOGGER.error(`Validation ${validation._id} does not have a file_id. Skipping.`);
			continue;
		}

		//
		// Set the cutoff date based on the validation status

		const thresholdValue = thresholdsByStatus[validation.feeder_status];

		if (!thresholdValue) {
			LOGGER.error(`No threshold defined for status ${validation.feeder_status}. Skipping validation ${validation._id}.`);
			continue;
		}

		const cutoffUnixTimestamp = Dates.now('Europe/Lisbon').unix_timestamp - thresholdValue as UnixTimestamp;

		//
		// Check if the validation is older than the cutoff date

		if (validation.created_at > cutoffUnixTimestamp) {
			LOGGER.info(`Validation ${validation._id} is not old enough. Skipping.`);
			continue;
		}

		//
		// If the validation is older than the cutoff date,
		// delete the associated files and the validation document.

		const fileDeletionTimer = new TIMETRACKER();

		try {
			await files.deleteById(validation.file_id);
			await gtfsValidations.deleteById(validation._id);
			LOGGER.success(`Deleted validation ${validation._id} and its associated file ${validation.file_id} in ${fileDeletionTimer.get()}.`);
		}
		catch (error) {
			LOGGER.error(`Failed to delete validation ${validation._id} or its associated file ${validation.file_id}:`, error);
		}

		//
	}

	LOGGER.terminate(`Cleanup completed in ${globalTimer.get()}`);

	//
}

/* * */

(async function init() {
	const runOnInterval = async () => {
		await cleanOldValidations();
		setTimeout(runOnInterval, 300_000); // 5 minutes in milliseconds
	};
	runOnInterval();
})();
