/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { importGtfsToDatabase } from '@tmlmobilidade/go-utils-import-gtfs';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/* * */

export async function importPlansTask() {
	const plans = await goDb.operation.plans.findMany({
		'$expr': { $eq: ['$hash', '$apps.organizer.last_hash'] },
		'apps.organizer.status': 'complete',
		'attachments.operation_gtfs_normalized': { $ne: null },
	});

	const directory = path.join(os.tmpdir(), 'plans-statistics');
	fs.mkdirSync(directory, { recursive: true });

	for (const plan of plans) {
		const fileId = plan.attachments.operation_gtfs_normalized;
		if (!fileId) continue;

		const databasePath = path.join(directory, `${encodeURIComponent(plan._id)}.db`);

		try {
			const url = await storageProvider.getSignedUrl({ fileId });
			// The importer appends rows, so each import must start with a fresh database.
			fs.rmSync(databasePath, { force: true });
			const gtfs = await importGtfsToDatabase({
				source: { url },
				sqlite_config: { instancePath: databasePath },
			});
			gtfs._db.databaseInstance.close();
			Logger.success(`Imported plan "${plan._id}" to ${databasePath}.`);
		} catch (error) {
			Logger.error({ error, message: `Error importing plan "${plan._id}".` });
		}
	}
}
