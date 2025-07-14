/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { files, validations } from '@tmlmobilidade/interfaces';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

async function cleanOldValidations() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Delete validations older than 30 days

		const thirdtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

		const cutoffDate = Dates.now('Europe/Lisbon').unix_timestamp - thirdtyDaysInMilliseconds as UnixTimestamp;

		//
		// Find validations older than 30 days

		const oldValidations = await validations.findMany({
			created_at: { $lte: cutoffDate },
		});

		LOGGER.info(`Found ${oldValidations.length} validations older than ${thirdtyDaysInMilliseconds} days`);

		//
		// Delete associated files and validations

		for (const validation of oldValidations) {
			// Delete associated files
			if (validation.file_id) {
				const fileDeletionTimer = new TIMETRACKER();

				await files.deleteById(validation.file_id);

				await validations.deleteById(validation._id);

				LOGGER.info(`Deleted files associated with validation ${validation._id}. (${fileDeletionTimer.get()})`);
			}
			else {
				LOGGER.info(`No files associated with validation ${validation._id}`);
			}
		}

		LOGGER.terminate(`Cleanup completed in ${globalTimer.get()}`);

		//
	}
	catch (err) {
		console.error('Error during validation cleanup:', err);
	}
}

(async function init() {
	const RUN_INTERVAL = 86400000; // 24 hours in milliseconds
	const runOnInterval = async () => {
		await cleanOldValidations();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
