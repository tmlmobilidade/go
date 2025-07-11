import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { files, validations } from '@tmlmobilidade/interfaces';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

// Funtion to clean old plans

async function cleanOldValidations() {
	try {
		LOGGER.init();
		const globalTimer = new TIMETRACKER();

		// setDate cutoffDate = 30 days in unixtimestamp
		const thirdtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

		// Calculate cutoff date
		const cutoffDate = Dates.now('Europe/Lisbon').unix_timestamp - thirdtyDaysInMilliseconds as UnixTimestamp;

		const oldValidations = await validations.findMany({
			created_at: { $lte: cutoffDate },
		});

		LOGGER.info(`Found ${oldValidations.length} validations older than ${thirdtyDaysInMilliseconds} days`);

		for (const validation of oldValidations) {
			// Delete associated files
			if (validation.file_id) {
				const fileIds = files.deleteById(validation.file_id);
				const fileDeletionTimer = new TIMETRACKER();
				const deleteFilesResult = await files.deleteMany({
					_id: { fileIds },
				});
				LOGGER.info(`Deleted ${deleteFilesResult.deletedCount} files associated with validation ${validation._id}. (${fileDeletionTimer.get()})`);
			}
			else {
				LOGGER.info(`No files associated with validation ${validation._id}`);
			}
		}

		// Process deletions
		if (oldValidations.length > 0) {
			const deleteTimer = new TIMETRACKER();

			const deleteResult = await validations.deleteMany({
				_id: { $in: oldValidations.map(v => v._id) },
			});

			LOGGER.info(`Deleted ${deleteResult.deletedCount} old validations. (${deleteTimer.get()})`);
		}
		else {
			LOGGER.info('No old validations found to clean');
		}

		LOGGER.terminate(`Cleanup completed in ${globalTimer.get()}`);
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
