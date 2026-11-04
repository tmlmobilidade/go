/* * */

import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { importGtfsToDatabase } from '@tmlmobilidade/go-utils-import-gtfs';
import fs from 'node:fs';

/* * */

/** Imports one normalized GTFS into a fresh SQLite file and retains it after closing. */
export async function importPlanGtfs(fileId: string, databasePath: string): Promise<void> {
	//
	// The importer downloads the GTFS using the signed storage URL.

	const url = await storageProvider.getSignedUrl({ fileId });

	//
	// Start with a fresh database because the importer appends to existing tables.

	fs.rmSync(databasePath, { force: true });

	const gtfs = await importGtfsToDatabase({
		source: { url },
		sqlite_config: { instancePath: databasePath },
	});

	//
	// Close the connection directly: cleanup() would also delete the database file.

	gtfs._db.databaseInstance.close();
}
