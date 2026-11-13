/* * */

import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type GtfsSQLTables, importGtfsToDatabase } from '@tmlmobilidade/go-utils-import-gtfs';
import fs from 'node:fs';

/* * */

/** Imports one normalized GTFS into a fresh SQLite file. The caller must close the connection. */
export async function importPlanGtfs(fileId: string, databasePath: string): Promise<GtfsSQLTables> {
	//
	// The importer downloads the GTFS using the signed storage URL.

	const url = await storageProvider.getSignedUrl({ fileId });

	//
	// Start with a fresh database because the importer appends to existing tables.

	fs.rmSync(databasePath, { force: true });

	return importGtfsToDatabase({
		source: { url },
		sqlite_config: { instancePath: databasePath },
	});
}
