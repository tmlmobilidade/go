/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
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

	const allExpiredValidations = await goDb.operation.gtfsValidations.findMany({
		created_at: { $lt: Dates.now('utc').minus({ days: 30 }).unix_milliseconds },
	});

	Logger.info({ message: `Found ${allExpiredValidations.length} expired validations.` });

	//
	// Loop through all expired validations and delete both the database document
	// as well as the associated file from storage.

	for (const validationData of allExpiredValidations) {
		//

		//
		// Check that the validation has the required properties

		if (!validationData.file_id) {
			Logger.error({ message: `Validation ${validationData._id} does not have a file_id. Skipping.` });
			continue;
		}

		//
		// If the validation is older than the cutoff date,
		// delete the associated files and the validation document.

		const fileDeletionTimer = new Timer();

		await storageProvider.delete(validationData.file_id, {
			onSuccess: async () => {
				await goDb.operation.gtfsValidations.deleteById(validationData._id);
			},
		});

		Logger.success(`Deleted validation ${validationData._id} and its associated file ${validationData.file_id} in ${fileDeletionTimer.get()}.`);

		//
	}

	Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);
}
