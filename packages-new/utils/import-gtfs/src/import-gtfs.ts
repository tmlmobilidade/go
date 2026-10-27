/* * */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { initGtfsSqlTables } from './tables.js';
import { type GtfsSQLTables, type ImportGtfsConfig } from './types.js';

/* * */

/**
 * Imports a GTFS ZIP using the bundled Go CLI and opens its SQLite table handles.
 * Relative source and output paths resolve against the caller's working directory.
 * The caller owns the resulting database and its cleanup. Import failures reject.
 * T describes the complete table bundle; it does not validate or convert row values.
 * Custom bundles must account for missing tables in the source archive.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Each table in the caller's bundle can have its own row type.
export async function importGtfsToDatabase<T extends GtfsSQLTables<any> = GtfsSQLTables>(config: ImportGtfsConfig): Promise<T> {
	const executablePath = fileURLToPath(new URL('./bin/import-gtfs', import.meta.url));
	const stdout = await importGtfs(executablePath, config);
	return initGtfsSqlTables<T>(config.sqlite_config?.memory ? stdout : stdout.toString('utf8').trim());
}

/** Collect stdout as data while forwarding telemetry from stderr as it arrives. */
async function importGtfs(executablePath: string, config: ImportGtfsConfig): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const child = spawn(executablePath, ['-config', JSON.stringify(config)], {
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		const chunks: Buffer[] = [];
		let stderr = '';
		child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
		child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
			stderr += chunk;
			process.stderr.write(chunk);
		});
		child.on('error', reject);
		child.on('close', (code, signal) => {
			if (code !== 0) return reject(new Error(`GTFS import failed (${signal ?? code}): ${stderr.trim()}`));
			resolve(Buffer.concat(chunks));
		});
	});
}
