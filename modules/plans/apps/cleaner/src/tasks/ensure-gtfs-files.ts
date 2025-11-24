/* * */

import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * This script makes sure the associated GTFS files of plan documents
 * have the correct feed_info.txt and agency.txt informations.
 * This will download the zip archive, unzip it, check and update the
 * necessary files, re-zip it and upload it again, for each plan document.
 */
export async function ensureGtfsFiles() {
	//

	Logger.init();

	const globalTimer = new Timer();

	// HERE

	Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);

	//
}
