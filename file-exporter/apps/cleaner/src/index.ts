/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { fileExports, files } from '@tmlmobilidade/interfaces';
import { ProcessingStatusSchema } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

const RUN_INTERVAL = 5 * 60_000; // 5 minutes in milliseconds

/**
 * This script removes file-export documents and their associated files
 * that are older than a given threshold (4 hours). Depending on the status of the file export,
 * it will delete the associated files and the file export document itself.
 */
async function main() {
	//

	LOGGER.init();

	const globalTimer = new TIMETRACKER();

	//
	// Get all GTFS Validation documents from the database

	const allFileExports = await fileExports.findMany({ 
		processing_status: { $in: [
			ProcessingStatusSchema.enum.complete,
			ProcessingStatusSchema.enum.error,
		] }, 
		updated_at: { $lt: Dates.now('local').minus({ hours: 4 }).unix_timestamp } 
	});

	//
	// Loop through all validations and filter out, for each status,
	// those that are older than the threshold

	for (const item of allFileExports) {
		//

		//
		// If the file export is older than the cutoff date,
		// delete the associated files and the file export document.
		try {
			await files.deleteById(item.file_id);
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
		await main();
		setTimeout(runOnInterval, 300_000); // 5 minutes in milliseconds
	};
	runOnInterval();
})();
