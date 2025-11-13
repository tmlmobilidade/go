/* * */

import { Dates } from '@tmlmobilidade/dates';
import { sessions, verificationTokens } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const RUN_INTERVAL = 300_000; // 5 minutes in milliseconds

/* * */

async function cleanExpiredDocuments(collection: typeof sessions | typeof verificationTokens, collectionName: string): Promise<void> {
	try {
		Logger.info(`Cleaning expired ${collectionName} documents...`);

		// Get the current date and time in the local timezone
		const now = Dates.now('Europe/Lisbon').unix_timestamp;
		const deleteResult = await collection.deleteMany({ expires_at: { $lt: now } });

		Logger.success(`Deleted ${deleteResult.deletedCount} expired ${collectionName} documents.`);
	}
	catch (error) {
		Logger.error(`Failed to clean expired ${collectionName} documents:`, error);
	}
}

(async function init() {
	const runOnInterval = async () => {
		Logger.init();
		const globalTimer = new Timer();

		await cleanExpiredDocuments(verificationTokens, 'verification tokens');
		await cleanExpiredDocuments(sessions, 'sessions');

		Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);

		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
