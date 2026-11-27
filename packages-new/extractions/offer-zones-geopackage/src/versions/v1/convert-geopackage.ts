import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { runGdalConversion } from './run-gdal-conversion.js';

/* * */

/**
 * Converts a GeoJSON file to a GeoPackage file using GDAL.
 * GDAL must be run in its own process so each export gets its own output directory.
 *
 * @param inputPath - The path to the input GeoJSON file.
 */
export async function convertGeoPackage(inputPath: string): Promise<void> {
	const gdalAssetsDirectory = new URL('.', import.meta.resolve('gdal3.js'));
	await promisify(execFile)(process.execPath, [import.meta.filename, inputPath], {
		cwd: gdalAssetsDirectory,
	});
}

/* * */

if (import.meta.main) {
	const inputPath = process.argv[2];
	await runGdalConversion(inputPath);
}
