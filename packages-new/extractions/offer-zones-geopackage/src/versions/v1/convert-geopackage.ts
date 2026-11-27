import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { runGdalConversion } from './run-gdal-conversion.js';

/* * */

/**
 * Runs this module in a child Node process and waits for conversion to finish.
 * Each child gets its own GDAL output directory while the parent can keep the worker heartbeat running.
 * @param inputPath Absolute path to the temporary zones.geojson, also used to locate the output directory.
 */
export async function convertGeoPackage(inputPath: string): Promise<void> {
	// GDAL resolves its bundled WebAssembly and projection data relative to the working directory.
	const gdalAssetsDirectory = new URL('.', import.meta.resolve('gdal3.js'));
	await promisify(execFile)(process.execPath, [import.meta.filename, inputPath], {
		cwd: gdalAssetsDirectory,
	});
}

/* * */

// This branch runs in the child when Node launches this file directly.
if (import.meta.main) {
	const inputPath = process.argv[2];
	await runGdalConversion(inputPath);
}
