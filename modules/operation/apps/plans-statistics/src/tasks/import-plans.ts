/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { importGtfsToDatabase } from '@tmlmobilidade/go-utils-import-gtfs';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/* * */

/** Imports each normalized plan GTFS into a local SQLite file, without calculating statistics. */
export async function importPlansTask() {
	//
	// Only import plans whose organizer has finished processing the current hash.

	const plans = await goDb.operation.plans.findMany({
		'$expr': { $eq: ['$hash', '$apps.organizer.last_hash'] },
		'apps.organizer.status': 'complete',
		'attachments.operation_gtfs_normalized': { $ne: null },
	});

	//
	// Keep the database files in the system's temporary directory, one per plan.

	const directory = path.join(os.tmpdir(), 'plans-statistics');
	fs.mkdirSync(directory, { recursive: true });

	//
	// Process plans sequentially so only one GTFS import runs at a time.

	for (const plan of plans) {
		const fileId = plan.attachments.operation_gtfs_normalized;
		if (!fileId) continue;

		const databasePath = path.join(directory, `${encodeURIComponent(plan._id)}.db`);

		try {
			const url = await storageProvider.getSignedUrl({ fileId });

			fs.rmSync(databasePath, { force: true });

			const gtfs = await importGtfsToDatabase({
				source: { url },
				sqlite_config: { instancePath: databasePath },
			});

			// Close the connection directly: cleanup() would also delete the database file.
			gtfs._db.databaseInstance.close();
			Logger.success(`Imported plan "${plan._id}" to ${databasePath}.`);
		} catch (error) {
			// An import failure must not prevent the remaining plans from being processed.
			Logger.error({ error, message: `Error importing plan "${plan._id}".` });
		}
	}
}
