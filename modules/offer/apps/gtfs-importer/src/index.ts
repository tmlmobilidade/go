/* * */

import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import path from 'path';

import { importGtfs } from './main.js';
import { type ImportOptions } from './types.js';

/* * */

export async function runImport() {
	const options: ImportOptions = {
		gtfsPath: path.resolve('/Users/afonsoesteves/Downloads/GTFS/GTFS_42'),
	};
	await importGtfs(options);
}

runImport().catch((error) => {
	Logger.critical({ error, message: 'Error importing GTFS' });
	process.exit(1);
});
