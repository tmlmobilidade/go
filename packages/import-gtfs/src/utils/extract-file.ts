/* * */

import { type ImportGtfsContext } from '@/types.js';
import { unzipFile } from '@/utils/unzip-file.js';
import { files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Plan } from '@tmlmobilidade/types';
import fs from 'node:fs';

/**
 * Downloads and extracts the GTFS files for the given plan.
 * @param plan The plan containing the operation_file_id to download and extract.
 * @returns The working directory containing the extracted GTFS files.
 */
export async function downloadAndExtractGtfs(plan: Plan): Promise<ImportGtfsContext['workdir']> {
	//

	// Return early if no operation file is found

	if (!plan.operation_file_id) {
		Logger.error(`No operation file found for plan "${plan._id}".`);
		process.exit(1);
	}

	//
	// Prepare the working directory

	const workdirPath = `/tmp/${plan._id}`;
	const downloadFilePath = `${workdirPath}/${plan.operation_file_id}.zip`;
	const extractDirPath = `${workdirPath}/extracted`;

	try {
		fs.rmSync(workdirPath, { force: true, recursive: true });
		fs.mkdirSync(workdirPath, { recursive: true });

		Logger.success('Prepared working directory.', 1);
	} catch (error) {
		Logger.error(`Error preparing workdir path "${workdirPath}".`, error);
		process.exit(1);
	}

	//
	// Get the associated Operation GTFS archive URL,
	// and try to download, save and unzip it.

	const operationFileData = await files.findById(plan.operation_file_id);
	if (!operationFileData || !operationFileData.url) {
		Logger.error(`No operation file found for plan "${plan._id}".`);
		process.exit(1);
	}

	try {
		const downloadResponse = await fetch(operationFileData.url);
		const downloadArrayBuffer = await downloadResponse.arrayBuffer();
		fs.writeFileSync(downloadFilePath, Buffer.from(downloadArrayBuffer));
	} catch (error) {
		Logger.error('Error downloading the file.', error);
		process.exit(1);
	}

	try {
		await unzipFile(downloadFilePath, extractDirPath);
		Logger.success(`Unzipped GTFS file from "${downloadFilePath}" to "${extractDirPath}".`, 1);
	} catch (error) {
		Logger.error('Error unzipping the file.', error);
		process.exit(1);
	}

	return {
		download_file_path: downloadFilePath,
		extract_dir_path: extractDirPath,
		path: workdirPath,
	};

	//
}
