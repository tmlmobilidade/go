/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Files } from '@tmlmobilidade/go-utils-files';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';

import { exportRidesFile } from './tasks/export-rides.js';
import { exportSamsAnalysisFile } from './tasks/export-sams-analysis.js';
import { exportStopsFile } from './tasks/export-stops.js';
import { exportVehiclesFile } from './tasks/export-vehicles.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'export-files', message: 'Sentry Exporter Files initialized', module: 'exporter', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Exporter Files' });
}

async function main() {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Get the file exports waiting to be processed

	const waitingFileExports = await goDb.core.exports.findMany({ processing_status: 'waiting' });

	Logger.info({ message: `Found ${waitingFileExports.length} waiting file exports.` });

	//
	// Process each file export, upload the resulting file
	// to the storage service and update the file export.

	for (const fileExport of waitingFileExports) {
		let pathToFile: string | undefined;

		try {
			Logger.info({ message: `Processing file export ${fileExport._id} (${fileExport.type}).` });

			//
			// Build the file for this export type

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
					Logger.error({ message: `GTFS export not implemented yet.` });
					Logger.error({ message: `Unknown file export type: ${fileExport.type}.` });
					continue;
			}

			//
			// Upload the file to the storage service and update the file export

			if (pathToFile) {
				const fileStream = fs.createReadStream(pathToFile, 'utf-8');

				const file = await storageProvider.upload(fileStream, {
					created_by: 'system',
					name: fileExport.file_name,
					resource_id: fileExport._id,
					scope: 'exports',
					size: fs.statSync(pathToFile).size,
					type: Files.getFileExtensionFromMimeType(Files.getFileExtension(fileExport.file_name)),
					updated_by: 'system',
				});

				await goDb.core.exports.updateById(fileExport._id, { file_id: file._id, processing_status: 'complete' });
			}
		} catch (error) {
			Logger.error(error);
			Logger.error({ message: `Error processing file export ${fileExport._id} (${fileExport.type}): ${error instanceof Error ? error.message : 'Unknown error'}.` });
			await goDb.core.exports.updateById(fileExport._id, { processing_status: 'error' });
			continue;
		}
	}

	Logger.terminate(`Run took ${globalTimer.get()}.`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '5s' });
