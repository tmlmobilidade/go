/* * */

import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { initGtfsSqlTables } from './tables.js';
import { type GtfsSQLTables, type ImportGtfsConfig } from './types.js';

/* * */

const execFileAsync = promisify(execFile);

/* * */

/**
 * Imports a GTFS ZIP using the bundled Go CLI and opens its SQLite table handles.
 * Relative source and output paths resolve against the caller's working directory.
 * The caller owns the resulting file and its cleanup. Import failures reject.
 */
export async function importGtfsToDatabase(config: ImportGtfsConfig): Promise<GtfsSQLTables> {
	const executablePath = fileURLToPath(new URL('./bin/import-gtfs', import.meta.url));
	const { stdout } = await execFileAsync(executablePath, ['-config', JSON.stringify(config)], { encoding: 'utf8' });
	return initGtfsSqlTables(stdout.trim());
}
