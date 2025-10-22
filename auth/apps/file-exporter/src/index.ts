// /* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { fileExports, files } from '@tmlmobilidade/interfaces';
import { ProcessingStatusSchema } from '@tmlmobilidade/types';
import { Files } from '@tmlmobilidade/utils';
import fs from 'fs';

import { exportRidesFile } from './export-rides.js';

/* * */

const RUN_INTERVAL = 30_000; // 30 seconds in milliseconds

async function main() {
	//

	LOGGER.init();

	const globalTimer = new TIMETRACKER();

	const waitingFileExports = await fileExports.findMany({ processing_status: ProcessingStatusSchema.enum.waiting });

	LOGGER.info(`Found ${waitingFileExports.length} waiting file exports.`);

	for (const fileExport of waitingFileExports) {
		let pathToFile: string | undefined;

		//
		// Process the file export.
		switch (fileExport.type) {
			case 'ride':
				pathToFile = await exportRidesFile(fileExport);
				break;
			default:
				LOGGER.error(`Unknown file export type: ${fileExport.type}.`);
				continue;
		}

		//
		// Upload the file to the storage service & update the file export.
		if (pathToFile) {
			const fileStream = fs.createReadStream(pathToFile);

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
	}

	LOGGER.terminate(`Run took ${globalTimer.get()}.`);

	//
}

/* * */

(async function init() {
	const runOnInterval = async () => {
		await main();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();

/* * */
