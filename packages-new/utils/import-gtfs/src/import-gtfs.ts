/* * */

import { execFile, spawn } from 'node:child_process';
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
 * The caller owns the resulting database and its cleanup. Import failures reject.
 */
export async function importGtfsToDatabase(config: ImportGtfsConfig): Promise<GtfsSQLTables> {
	const executablePath = fileURLToPath(new URL('./bin/import-gtfs', import.meta.url));
	if (config.sqlite_config?.memory) {
		return initGtfsSqlTables(await importGtfsToMemory(executablePath, config));
	}
	const { stdout } = await execFileAsync(executablePath, ['-config', JSON.stringify(config)], { encoding: 'utf8' });
	return initGtfsSqlTables(stdout.trim());
}

/** Collect binary stdout without execFile's output size limit. */
async function importGtfsToMemory(executablePath: string, config: ImportGtfsConfig): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const child = spawn(executablePath, ['-config', JSON.stringify(config)], {
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		const chunks: Buffer[] = [];
		let stderr = '';
		child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
		child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
			stderr += chunk;
		});
		child.on('error', reject);
		child.on('close', (code, signal) => {
			if (code !== 0) return reject(new Error(`GTFS import failed (${signal ?? code}): ${stderr.trim()}`));
			resolve(Buffer.concat(chunks));
		});
	});
}
