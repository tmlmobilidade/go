/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { fileExports, files, verificationTokens } from '@tmlmobilidade/interfaces';
import { ProcessingStatusSchema, type UnixTimestamp } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/**
 * This script removes verification-token documents
 * that are older than a given threshold (30 days).
 */
async function cleanOldValidations() {
	//

	LOGGER.init();

	const globalTimer = new TIMETRACKER();

	//
	// Get all GTFS Validation documents from the database

	const allVerificationTokens = await verificationTokens.all();

	LOGGER.info(`Found ${allVerificationTokens.length} verification tokens.`);

	//
	// Loop through all validations and filter out, for each status,
	// those that are older than the threshold

	for (const verificationToken of allVerificationTokens) {
		//

		//
		// Check that the validation has the required properties

		if (!verificationToken._id) {
			LOGGER.error(`Verification token ${verificationToken._id} does not have an _id. Skipping.`);
			continue;
		}

		//
		// Set the cutoff date based on the verification token status

		const threshold = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
		const cutoffUnixTimestamp = Dates.now('Europe/Lisbon').unix_timestamp - threshold as UnixTimestamp;

		//
		// Check if the validation is older than the cutoff date

		if (verificationToken.created_at > cutoffUnixTimestamp) {
			LOGGER.info(`Verification token ${verificationToken._id} is not old enough. Skipping.`);
			continue;
		}

		//
		// If the validation is older than the cutoff date,
		// delete the associated files and the validation document.
		try {
			await verificationTokens.deleteById(verificationToken._id);
			LOGGER.success(`Deleted verification token ${verificationToken._id}.`);
		}
		catch (error) {
			LOGGER.error(`Failed to delete verification token ${verificationToken._id}:`, error);
		}

		//
	}

	LOGGER.terminate(`Cleanup completed in ${globalTimer.get()}`);

	//
}

/**
 * This script removes file-export documents and their associated files
 * that are older than a given threshold (4 hours). Depending on the status of the file export,
 * it will delete the associated files and the file export document itself.
 */
async function cleanOldFileExports() {
	//

	LOGGER.init();

	const globalTimer = new TIMETRACKER();

	//
	// Mark all processing file exports as error that are older than 2 hours

	const allProcessingFileExports = await fileExports.findMany({
		created_at: { $lt: Dates.now('local').minus({ hours: 2 }).unix_timestamp },
		processing_status: ProcessingStatusSchema.enum.processing,
	});

	LOGGER.info(`MARKING PROCESSING FILE EXPORTS AS ERROR: ${allProcessingFileExports.length} file exports...`);

	for (const item of allProcessingFileExports) {
		try {
			await fileExports.updateById(item._id, { processing_status: ProcessingStatusSchema.enum.error });
			LOGGER.success(`Marked processing file export ${item._id} as error.`);
		}
		catch (error) {
			LOGGER.error(`Failed to mark processing file export ${item._id} as error:`, error);
		}
	}

	//
	// Delete all file exports that are older than 4 hours and have a status of complete or error

	const allFileExports = await fileExports.findMany({
		processing_status: { $in: [
			ProcessingStatusSchema.enum.complete,
			ProcessingStatusSchema.enum.error,
		] },
		updated_at: { $lt: Dates.now('local').minus({ hours: 4 }).unix_timestamp },
	});

	LOGGER.info(`DELETING OLD FILE EXPORTS: ${allFileExports.length} file exports...`);

	for (const item of allFileExports) {
		//

		//
		// If the file export is older than the cutoff date,
		// delete the associated files and the file export document.
		try {
			try {
				await files.deleteById(item.file_id);
			}
			catch (error) {
				LOGGER.error(`Failed to delete file ${item.file_id}:`, error);
			}

			await fileExports.deleteById(item._id);
			LOGGER.success(`Deleted file export ${item._id}.`);
		}
		catch (error) {
			LOGGER.error(`Failed to delete file export ${item._id}:`, error);
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
		await cleanOldFileExports();
		setTimeout(runOnInterval, 300_000); // 5 minutes in milliseconds
	};
	runOnInterval();
})();
