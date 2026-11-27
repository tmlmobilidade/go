import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

/* * */

/**
 * Starts the GDAL conversion in a child Node process and waits for it to finish.
 * Each child gets its own GDAL output directory while the parent can keep the worker heartbeat running.
 * @param inputPath Absolute path to the temporary zones.geojson, also used to locate the output directory.
 */
export async function convertGeoPackage(inputPath: string): Promise<void> {
	//
	// GDAL resolves its bundled WebAssembly and projection data relative to the working directory.

	const gdalAssetsDirectory = new URL('.', import.meta.resolve('gdal3.js'));
	const entryPath = fileURLToPath(new URL('./gdal-conversion.cli.js', import.meta.url));

	await promisify(execFile)(process.execPath, [entryPath, inputPath], {
		cwd: gdalAssetsDirectory,
	});
}
