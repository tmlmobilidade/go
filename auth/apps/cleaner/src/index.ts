/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { verificationTokens } from '@tmlmobilidade/interfaces';
import { type UnixTimestamp } from '@tmlmobilidade/types';
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

/* * */

(async function init() {
	const runOnInterval = async () => {
		await cleanOldValidations();
		setTimeout(runOnInterval, 300_000); // 5 minutes in milliseconds
	};
	runOnInterval();
})();
