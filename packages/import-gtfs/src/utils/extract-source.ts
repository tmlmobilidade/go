/* * */

import { type ImportGtfsToDatabaseConfig } from '@/types/config.js';
import { type ImportGtfsContext } from '@/types/context.js';
import { unzipFile } from '@/utils/unzip-file.js';
import { Logger } from '@tmlmobilidade/logger';
import fs from 'node:fs';

/**
 * Downloads and extracts the GTFS file from the given URL to the working directory.
 * @param source The source of the GTFS data to extract.
 * @param context The context for the import run.
 */
export async function extractGtfsSource(context: ImportGtfsContext, config: ImportGtfsToDatabaseConfig) {
	//

	//
	// Prepare the working directory

	fs.rmSync(context.workdir.path, { force: true, recursive: true });
	fs.mkdirSync(context.workdir.path, { recursive: true });
	Logger.success(`Prepared working directory at "${context.workdir.path}".`, 1);

	//
	// If source is a URL, download the GTFS file from the given URL,
	// and save it to the working directory.
	// If source is a path, copy the GTFS file from the given path to the working directory.
	// Then unzip it.

	if ('url' in config.source) {
		Logger.info({ message: `Downloading GTFS file from URL: ${config.source.url}` });
		const downloadResponse = await fetch(config.source.url);
		const downloadArrayBuffer = await downloadResponse.arrayBuffer();
		fs.writeFileSync(context.workdir.download_file_path, Buffer.from(downloadArrayBuffer));
		Logger.success(`Downloaded GTFS file from URL: ${config.source.url}`);
	}

	if ('path' in config.source) {
		Logger.info({ message: `Copying GTFS file from path: ${config.source.path}` });
		fs.copyFileSync(config.source.path, context.workdir.download_file_path);
		Logger.success(`Copied GTFS file from path: ${config.source.path}`);
	}

	//
	// Unzip the GTFS file.

	Logger.info({ message: 'Unzipping GTFS file...' });
	await unzipFile(context.workdir.download_file_path, context.workdir.extract_dir_path);
	Logger.success(`Unzipped GTFS file from "${context.workdir.download_file_path}" to "${context.workdir.extract_dir_path}".`, 1);
}
