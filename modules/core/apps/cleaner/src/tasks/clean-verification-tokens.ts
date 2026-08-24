/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Cleans expired verification token documents
 * from the "verification_tokens" collection.
 */
export async function cleanExpiredVerificationTokens() {
	try {
		const timer = new Timer();
		Logger.info({ message: `Cleaning expired "verification_tokens" documents...` });
		const now = Dates.now('utc').unix_timestamp;
		const deleteResult = await goDb.core.verificationTokens.deleteMany({ expires_at: { $lt: now } });
		Logger.success(`Deleted ${deleteResult.deletedCount} expired "verification_tokens" documents in ${timer.get()}.`);
	} catch (error) {
		Logger.error({ error, message: `Failed to clean expired "verification_tokens" documents:` });
	}
}
