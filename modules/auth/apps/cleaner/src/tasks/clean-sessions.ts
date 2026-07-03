/* * */

import { Dates } from '@tmlmobilidade/dates';
import { sessions } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Cleans expired session documents
 * from the "sessions" collection.
 */
export async function cleanExpiredSessions() {
	try {
		const timer = new Timer();
		Logger.info({ message: `Cleaning expired "sessions" documents...` });
		const now = Dates.now('Europe/Lisbon').unix_timestamp;
		const deleteResult = await sessions.deleteMany({ expires_at: { $lt: now } });
		Logger.success(`Deleted ${deleteResult.deletedCount} expired "sessions" documents in ${timer.get()}.`);
	}
	catch (error) {
		Logger.error({ error, message: `Failed to clean expired "sessions" documents:` });
	}
}
