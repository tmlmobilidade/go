/* * */

import { Dates } from '@tmlmobilidade/dates';
import { goDB } from '@tmlmobilidade/go-interfaces-go-db';
import { Logger } from '@tmlmobilidade/logger';
import { ProcessingStatusSchema } from '@tmlmobilidade/types';

/* * */

const PROCESSING_TIMEOUT_HOURS = 2;

/**
 * Marks processing file exports older than the threshold as error.
 */
export async function markStuckProcessingExportsAsError() {
	//

	const cutoffTimestamp = Dates.now('local').minus({ hours: PROCESSING_TIMEOUT_HOURS }).unix_timestamp;

	const stuckExports = await goDB.core.exports.findMany({ created_at: { $lt: cutoffTimestamp }, processing_status: ProcessingStatusSchema.enum.processing });

	if (stuckExports.length === 0) {
		Logger.info({ message: 'No stuck processing file exports found.' });
		return;
	}

	Logger.info({ message: `Marking ${stuckExports.length} stuck processing file exports as error...` });

	for (const item of stuckExports) {
		try {
			await goDB.core.exports.updateById(item._id, { processing_status: ProcessingStatusSchema.enum.error });
			Logger.success(`Marked processing file export ${item._id} as error.`);
		} catch (error) {
			Logger.error({ error, message: `Failed to mark processing file export ${item._id} as error:` });
		}
	}
}
