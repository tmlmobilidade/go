/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext } from '@tmlmobilidade/go-types-extractions';
import { startHeartbeat } from '@tmlmobilidade/go-utils-exec';
import { zipDirectory } from '@tmlmobilidade/go-utils-zip';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';
import path from 'node:path';

import { sendEmailNotification } from '../utils/send-email-notification.js';
import { uploadTaskResult } from '../utils/upload-task-result.js';
import { VERSIONS_MAP } from '../utils/versions.js';

/**
 * Runs the extraction task for the given Extraction ID, zips and uploads
 * the result, and updates the Extraction status in the database.
 * @param extractionId The ID of the Extraction to process.
 */
export async function processExtraction(extractionId: string): Promise<void> {
	//

	//
	// Retrieve the extraction from the database

	const currentExtraction = await goDb.core.extractions.findById(extractionId);

	if (!currentExtraction) {
		Logger.error({ message: `Extraction not found: ${extractionId}` });
		return;
	}

	//
	// Set a heartbeat to keep the job alive while processing

	const heartbeat = startHeartbeat({
		intervalMs: 30_000,
		runFn: async () => {
			await goDb.core.extractions.updateOne({ _id: extractionId }, { processing_status: 'processing' });
		},
	});

	//
	// Initialize the extraction context

	const temporaryDirectory = fs.mkdtempDisposableSync(`extraction-${extractionId}-`);

	const context: ExtractionTaskContext = {
		attachment_name: `extraction-${extractionId}.zip`,
		output_path: temporaryDirectory.path,
	};

	try {
		//

		//
		// Based on the extraction version, run the appropriate task.

		const taskTimer = new Timer();

		const taskRunner = VERSIONS_MAP[currentExtraction.version];
		if (!taskRunner) throw new Error(`No task runner found for version: ${currentExtraction.version}`);

		await taskRunner(context, currentExtraction);

		Logger.success(`Ran extraction "${extractionId}" task in ${taskTimer.get()}.`);

		//
		// Zip the extracted directory with the extraction files

		const zipTimer = new Timer();

		const zipFilePath = path.join(temporaryDirectory.path, context.attachment_name);

		await zipDirectory(temporaryDirectory.path, zipFilePath);

		Logger.success(`Zipped new extraction "${extractionId}" output directory in ${zipTimer.get()}.`);

		//
		// Upload the new extraction zip file to the storage provider.

		const uploadResult = await uploadTaskResult({
			attachment_name: context.attachment_name,
			created_by: currentExtraction.created_by,
			extraction_id: extractionId,
			updated_by: currentExtraction.updated_by,
			zip_file_path: zipFilePath,
		});

		//
		// Send email notification, if enabled

		if (currentExtraction.send_email_notification) {
			await sendEmailNotification({
				extraction_id: extractionId,
				user_id: currentExtraction.created_by as string,
			});
		}

		//
		// Perform workspace cleanup by stopping the heartbeat
		// and deleting the temporary directory

		heartbeat.stop();
		temporaryDirectory.remove();

		//
		// Update the extraction in the database.

		const updateExtractionTimer = new Timer();

		await goDb.core.extractions.updateOne({ _id: extractionId }, {
			attachment_id: uploadResult._id,
			processing_status: 'complete',
			retries: currentExtraction.retries + 1,
		});

		Logger.success(`Updated extraction "${extractionId}" in the database and stopped heartbeat in ${updateExtractionTimer.get()}.`);

		//
	} catch (error) {
		heartbeat.stop();
		temporaryDirectory.remove();
		await goDb.core.extractions.updateOne({ _id: extractionId }, { processing_status: 'error' });
		Logger.error({ error, message: `Error processing extraction ${extractionId}` });
		Logger.divider();
	}

	//
}
