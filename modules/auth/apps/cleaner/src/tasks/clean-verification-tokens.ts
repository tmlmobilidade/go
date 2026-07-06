/* * */

import { Dates } from '@tmlmobilidade/dates';
import { verificationTokens } from '@tmlmobilidade/interfaces';
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
		const now = Dates.now('Europe/Lisbon').unix_timestamp;
		const deleteResult = await verificationTokens.deleteMany({ expires_at: { $lt: now } });
		Logger.success(`Deleted ${deleteResult.deletedCount} expired "verification_tokens" documents in ${timer.get()}.`);
	}
	catch (error) {
		Logger.error({ error, message: `Failed to clean expired "verification_tokens" documents:` });
	}
}
