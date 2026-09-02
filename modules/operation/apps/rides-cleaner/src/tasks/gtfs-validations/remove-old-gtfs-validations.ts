/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * This script removes GTFS Validation documents and their associated files
 * that are older than a given threshold according to the its validity status.
 */
export async function removeOldGtfsValidationsTask() {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Get all GTFS Validation documents from the database

	const allValidations = await goDb.operation.gtfsValidations.findMany();

	Logger.info({ message: `Found ${allValidations.length} validations.` });

	//
	// Set the threshold for deletion (30 days)

	const thresholdsByProcessingStatus: Record<GtfsValidation['processing_status'], number> = {

		complete: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds

		error: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

		processing: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

		skipped: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

		waiting: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

	};

	//
	// Loop through all validations and filter out, for each status,
	// those that are older than the threshold

	for (const validation of allValidations) {
		//

		//
		// Check that the validation has the required properties

		if (!validation.file_id) {
			Logger.error({ message: `Validation ${validation._id} does not have a file_id. Skipping.` });
			continue;
		}

		//
		// Set the cutoff date based on the validation status

		const thresholdValue = thresholdsByProcessingStatus[validation.processing_status];

		if (!thresholdValue) {
			Logger.error({ message: `No threshold defined for status ${validation.processing_status}. Skipping validation ${validation._id}.` });
			continue;
		}

		const cutoffUnixMilliseconds = Dates.now('Europe/Lisbon').unix_milliseconds - thresholdValue as UnixMilliseconds;

		//
		// Check if the validation is older than the cutoff date

		if (validation.created_at > cutoffUnixMilliseconds) {
			Logger.info({ message: `Validation ${validation._id} is not old enough. Skipping.` });
			continue;
		}

		//
		// If the validation is older than the cutoff date,
		// delete the associated files and the validation document.

		const fileDeletionTimer = new Timer();

		try {
			await goDb.operation.gtfsValidations.deleteById(validation._id);
			await storageProvider.delete(validation.file_id);
			Logger.success(`Deleted validation ${validation._id} and its associated file ${validation.file_id} in ${fileDeletionTimer.get()}.`);
		} catch (error) {
			Logger.error({ error, message: `Failed to delete validation ${validation._id} or its associated file ${validation.file_id}:` });
		}

		//
	}

	Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);

	//
}
