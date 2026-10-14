/* * */

import { MongoDatabaseClient } from '@tmlmobilidade/go-clients-mongo';
import { PostgresDatabaseClient } from '@tmlmobilidade/go-clients-postgres';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { importStopsTask } from './tasks/import-stops.js';
import { parseImportOptions } from './utils/cli.js';

/* * */

/**
 * Runs the GTFS stops import with the supplied command-line options.
 */
async function main() {
	//

	//
	// Parse import options and initialize the logger

	const options = parseImportOptions();
	if (!options) return;

	Logger.init();

	//
	// Run the import task

	await importStopsTask(options);
}

/* * */

try {
	await main();
} catch (error) {
	Logger.error(error instanceof Error ? error : new Error(String(error)));
	process.exitCode = 1;
} finally {
	await Promise.all([MongoDatabaseClient.disconnectAll(), PostgresDatabaseClient.disconnectAll()]);
}
