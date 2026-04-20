// /* * */

import { Files } from '@tmlmobilidade/files';
import { fileExports, files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { ProcessingStatusSchema } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import fs from 'fs';

import { exportRidesFile } from './export-rides.js';
import { exportSamsAnalysisFile } from './export-sams-analysis.js';

/* * */

const RUN_INTERVAL = 5_000; // 30 seconds in milliseconds

async function main() {
	//

	Logger.init();

	const globalTimer = new Timer();

	const waitingFileExports = await fileExports.findMany({ processing_status: ProcessingStatusSchema.enum.waiting });

	Logger.info(`Found ${waitingFileExports.length} waiting file exports.`);

	for (const fileExport of waitingFileExports) {
		let pathToFile: string | undefined;

		try {
		//
		// Process the file export.
			switch (fileExport.type) {
				case 'ride':
					pathToFile = await exportRidesFile(fileExport);
					break;
				case 'sams_analysis':
					pathToFile = await exportSamsAnalysisFile(fileExport);
					break;
				default:
					Logger.error(`Unknown file export type: ${fileExport.type}.`);
					continue;
			}

			//
			// Upload the file to the storage service & update the file export.
			if (pathToFile) {
				const fileStream = fs.createReadStream(pathToFile, 'utf-8');

				const file = await files.upload(fileStream, {
					created_by: 'system',
					name: fileExport.file_name,
					resource_id: fileExport._id,
					scope: 'exports',
					size: fs.statSync(pathToFile).size,
					type: Files.getFileExtensionFromMimeType(Files.getFileExtension(fileExport.file_name)),
					updated_by: 'system',
				});

				await fileExports.updateById(fileExport._id, { file_id: file._id, processing_status: 'complete' });
			}
		} catch (error) {
			Logger.error(error);
			Logger.error(`Error processing file export: ${error instanceof Error ? error.message : 'Unknown error'}.`);
			await fileExports.updateById(fileExport._id, { processing_status: 'error' });
			continue;
		}
	}

	Logger.terminate(`Run took ${globalTimer.get()}.`);

	//
}

/* * */

runOnInterval(main, RUN_INTERVAL);
