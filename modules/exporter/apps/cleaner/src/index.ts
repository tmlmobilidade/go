/* * */

import { Dates } from '@tmlmobilidade/dates';
import { fileExports, files, TransactionManager } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { ProcessingStatusSchema } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';

const RUN_INTERVAL = 300_000; // 5 minutes in milliseconds

const PROCESSING_TIMEOUT_HOURS = 2;
const DELETION_TIMEOUT_HOURS = 4;

/**
 * Marks processing file exports older than the threshold as error.
 */
async function markStuckProcessingExportsAsError(): Promise<void> {
	const cutoffTimestamp = Dates.now('local').minus({ hours: PROCESSING_TIMEOUT_HOURS }).unix_timestamp;

	const stuckExports = await fileExports.findMany({ created_at: { $lt: cutoffTimestamp }, processing_status: ProcessingStatusSchema.enum.processing });

	if (stuckExports.length === 0) {
		Logger.info('No stuck processing file exports found.');
		return;
	}

	Logger.info(`Marking ${stuckExports.length} stuck processing file exports as error...`);

	for (const item of stuckExports) {
		try {
			await fileExports.updateById(item._id, { processing_status: ProcessingStatusSchema.enum.error });
			Logger.success(`Marked processing file export ${item._id} as error.`);
		} catch (error) {
			Logger.error(`Failed to mark processing file export ${item._id} as error:`, error);
		}
	}
}

/**
 * Deletes file exports and their associated files that are older than the threshold.
 */
async function deleteOldFileExports(): Promise<void> {
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

/* * */

async function main() {
	Logger.init();
	const globalTimer = new Timer();

	await markStuckProcessingExportsAsError();
	await deleteOldFileExports();

	Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);
}

runOnInterval(main, RUN_INTERVAL);
