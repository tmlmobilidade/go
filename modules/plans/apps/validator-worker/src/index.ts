/* * */

import { PROCESSING_STALE_AFTER_MS } from '@/consts/timeout.js';
import { processValidation } from '@/tasks/index.js';
import { Dates } from '@tmlmobilidade/dates';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	Logger.init();

	const globalTimer = new Timer();

	try {
		const staleProcessingCutoff = (Dates.now('utc').unix_timestamp - PROCESSING_STALE_AFTER_MS) as UnixTimestamp;

		const waitingOrStuckGtfsValidations = await goDb.operation.gtfsValidations.findMany(
			{
				$or: [
					{ processing_status: 'processing', updated_at: { $lte: staleProcessingCutoff } },
					{ processing_status: 'waiting' },
				],
			},
			{ sort: { created_at: 1 } },
		);

		if (!waitingOrStuckGtfsValidations.length) {
			Logger.info({ message: 'No waiting validations to process. Exiting...' });
			return;
		}

		Logger.info({ message: `Found ${waitingOrStuckGtfsValidations.length} waiting or stuck validations...` });

		// Process sequentially so a worker runs at most one CPU-intensive Go
		// validator process at a time.
		for (const gtfsValidationData of waitingOrStuckGtfsValidations) {
			Logger.title(`Processing GTFS Validation ${gtfsValidationData._id} for File ${gtfsValidationData.file_id}`);
			await processValidation(gtfsValidationData);
			Logger.info({ message: `Finished processing validation ${gtfsValidationData._id} in ${globalTimer.get()}ms` });
		}
	} catch (error) {
		Logger.error({ error, message: 'Error processing validations:' });
	}

	Logger.terminate(`Validation completed in ${globalTimer.get()}`);
}

/* * */

await runOnInterval(main, { intervalMs: '1s' });
