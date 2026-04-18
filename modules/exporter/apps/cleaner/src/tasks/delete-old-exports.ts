/* * */

import { Dates } from '@tmlmobilidade/dates';
import { fileExports, files, TransactionManager } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { ProcessingStatusSchema } from '@tmlmobilidade/types';

/* * */

const DELETION_TIMEOUT_HOURS = 4;

/**
 * Deletes file exports and their associated files that are older than the threshold.
 */
export async function deleteOldFileExports(): Promise<void> {
	const cutoffTimestamp = Dates.now('local').minus({ hours: DELETION_TIMEOUT_HOURS }).unix_timestamp;

	const oldExports = await fileExports.findMany({
		processing_status: { $in: [
			ProcessingStatusSchema.enum.complete,
			ProcessingStatusSchema.enum.error,
		] },
		updated_at: { $lt: cutoffTimestamp },
	});

	if (oldExports.length === 0) {
		Logger.info('No old file exports found to delete.');
		return;
	}

	Logger.info(`Deleting ${oldExports.length} old file exports...`);

	const trasactionManager = new TransactionManager([files, fileExports] as const);

	for (const item of oldExports) {
		try {
			await trasactionManager.withTransaction(async (collections, transactions) => {
				const [filesCollection, fileExportsCollection] = collections;
				const filesTransaction = transactions.get(filesCollection);
				const fileExportsTransaction = transactions.get(fileExportsCollection);

				await filesCollection.deleteById(item.file_id, { session: filesTransaction.getSession() });
				await fileExportsCollection.deleteById(item._id, { session: fileExportsTransaction.getSession() });

				Logger.success(`Deleted file export ${item._id}.`);
			});
		} catch (error) {
			Logger.error(`Failed to delete file export ${item._id}:`, error);
		}
	}
}
