/* * */

import { type ImportGtfsContext } from '@/types/context.js';
import { unzipFile } from '@/utils/unzip-file.js';
import { Logger } from '@tmlmobilidade/logger';
import fs from 'node:fs';

/**
 * Downloads and extracts the GTFS file from the given URL to the working directory.
 * @param url The URL of the GTFS file to download and extract.
 * @param context The context for the import run.
 */
export async function downloadAndExtractGtfs(url: string, context: ImportGtfsContext) {
	//

	//
	// Prepare the working directory

	try {
		fs.rmSync(context.workdir.path, { force: true, recursive: true });
		fs.mkdirSync(context.workdir.path, { recursive: true });
		Logger.success(`Prepared working directory at "${context.workdir.path}".`, 1);
	} catch (error) {
		Logger.error(`Error preparing workdir path "${context.workdir.path}".`, error);
		process.exit(1);
	}

	//
	// Download the GTFS file from the given URL,
	// save it to the working directory, then unzip it.

	try {
		const downloadResponse = await fetch(url);
		const downloadArrayBuffer = await downloadResponse.arrayBuffer();
		fs.writeFileSync(context.workdir.download_file_path, Buffer.from(downloadArrayBuffer));
	} catch (error) {
		throw new Error('Error downloading the file.', error);
	}

	try {
		await unzipFile(context.workdir.download_file_path, context.workdir.extract_dir_path);
		Logger.success(`Unzipped GTFS file from "${context.workdir.download_file_path}" to "${context.workdir.extract_dir_path}".`, 1);
	} catch (error) {
		throw new Error('Error unzipping the file.', error);
	}
}
