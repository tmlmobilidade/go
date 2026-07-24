/* * */

import { Dates } from '@tmlmobilidade/dates';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Logger } from '@tmlmobilidade/logger-logger-backend';
import { ProcessingStatusSchema } from '@tmlmobilidade/types';

/* * */

const DELETION_TIMEOUT_HOURS = 4;

/**
 * Deletes file exports and their associated files that are older than the threshold.
 */
export async function deleteOldFileExports(): Promise<void> {
	const cutoffTimestamp = Dates.now('local').minus({ hours: DELETION_TIMEOUT_HOURS }).unix_timestamp;

	const oldExports = await goDb.core.exports.findMany({
		processing_status: { $in: [
			ProcessingStatusSchema.enum.complete,
			ProcessingStatusSchema.enum.error,
		] },
		updated_at: { $lt: cutoffTimestamp },
	});

	if (oldExports.length === 0) {
		Logger.info({ message: 'No old file exports found to delete.' });
		return;
	}

	Logger.info({ message: `Deleting ${oldExports.length} old file exports...` });

	for (const item of oldExports) {
		try {
			if (item.file_id) {
				//
				// Delete the blob/metadata first, then drop the export record.
				// Failure modes (handled by storage saga + hooks):
				// - file delete fails → export kept for a later retry
				// - export delete fails → onSuccess throws; file is already gone

				await storageProvider.delete(item.file_id, {
					onSuccess: async () => {
						await goDb.core.exports.deleteById(item._id);
					},
				});
			} else {
				await goDb.core.exports.deleteById(item._id);
			}

			Logger.success(`Deleted file export ${item._id}.`);
		} catch (error) {
			Logger.error({ error, message: `Failed to delete file export ${item._id}:` });
		}
	}
}
