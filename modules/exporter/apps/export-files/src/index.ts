// /* * */

import { Files } from '@tmlmobilidade/files';
import { fileExports, files } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { ProcessingStatusSchema } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import fs from 'fs';

import { exportRidesFile } from './export-rides.js';
import { exportSamsAnalysisFile } from './export-sams-analysis.js';
import { exportStopsFile } from './export-stops.js';
import { exportVehiclesFile } from './export-vehicles.js';

/* * */

async function main() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'export-files', message: 'Sentry Exporter Files initialized', module: 'exporter', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Exporter Files', error);
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	const waitingFileExports = await fileExports.findMany({ processing_status: ProcessingStatusSchema.enum.waiting });

	Logger.info(`Found ${waitingFileExports.length} waiting file exports.`);

	for (const fileExport of waitingFileExports) {
		let pathToFile: string | undefined;

		try {
			Logger.info(`Processing file export ${fileExport._id} (${fileExport.type}).`);

			//
			// Process the file export.
			switch (fileExport.type) {
				case 'ride':
					pathToFile = await exportRidesFile(fileExport);
					break;
				case 'sams_analysis':
					pathToFile = await exportSamsAnalysisFile(fileExport);
					break;
				case 'stop':
					pathToFile = await exportStopsFile(fileExport);
					break;
				case 'vehicle':
					pathToFile = await exportVehiclesFile(fileExport);
					break;
				case 'gtfs':
				default:
					// TODO: Implement GTFS export
					Logger.error(`GTFS export not implemented yet.`);
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
			Logger.error(`Error processing file export ${fileExport._id} (${fileExport.type}): ${error instanceof Error ? error.message : 'Unknown error'}.`);
			await fileExports.updateById(fileExport._id, { processing_status: 'error' });
			continue;
		}
	}

	Logger.terminate(`Run took ${globalTimer.get()}.`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '5s' });
