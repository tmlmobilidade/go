/* * */

import { processValidation } from '@/tasks/index.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	Logger.init();

	const globalTimer = new Timer();

	try {
		const waitingOrProcessingGtfsValidations = await goDb.operation.gtfsValidations.findMany(
			{
				$or: [
					{ processing_status: 'processing' },
					{ processing_status: 'waiting' },
				],
			},
			{ sort: { created_at: 1 } },
		);

		if (!waitingOrProcessingGtfsValidations.length) {
			Logger.info({ message: 'No waiting validations to process. Exiting...' });
			return;
		}

		Logger.info({ message: `Found ${waitingOrProcessingGtfsValidations.length} waiting or processing validations...` });

		// Process sequentially so a worker runs at most one CPU-intensive Go
		// validator process at a time.
		for (const gtfsValidationData of waitingOrProcessingGtfsValidations) {
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
