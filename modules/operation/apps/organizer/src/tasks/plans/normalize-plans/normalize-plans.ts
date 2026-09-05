/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { getPlanHash } from '@tmlmobilidade/go-operation-pckg-utils';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { unzipFile } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import fs from 'node:fs';
import path from 'node:path';
import { ZipFile } from 'yazl';

import { initNormalizePlansTaskContext } from './context/init-context.js';
import { updateAgencyTxtContents } from './steps/agency.js';
import { updateFeedInfoTxtContents } from './steps/feed-info.js';
import { rewriteShapeIdsToPatternIds } from './steps/shapes.js';

/**
 * This task makes sure the associated GTFS files of plan documents have the correct
 * agency.txt and feed_info.txt information, and that the shape_id values of trips.txt
 * and shapes.txt match the pattern_id of each trip.
 * This will download the zip archive, unzip it, check and update the necessary files,
 * re-zip it and upload it again, for each plan document.
 */
export async function normalizePlansTask() {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Fetch all plans from the database

	const allPlans = await goDb.operation.plans.findMany({
		$expr: {
			$ne: ['$hash', '$apps.organizer.last_hash'],
		},
	});

	Logger.info({ message: `Found ${allPlans.length} plans.` });

	//
	// Normalize each plan

	for (const planData of allPlans) {
		//

		Logger.info({ message: `Processing plan ${planData._id}` });

		//
		// Initialize the context

		const context = await initNormalizePlansTaskContext(planData);

		//
		// Download the operation file from storage

		if (!planData.operation_file_id) {
			Logger.error({ message: `[${planData._id}] No Operation file ID found.` });
			continue;
		}

		const operationFileData = await storageProvider.findById(planData.operation_file_id);

		if (!operationFileData?.url) {
			Logger.error({ message: `[${planData._id}] Operation file "${planData.operation_file_id}" not found.` });
			continue;
		}

		Logger.info({ message: `Downloading GTFS file from URL: ${operationFileData.url}` });
		const downloadResponse = await fetch(operationFileData.url);
		const downloadArrayBuffer = await downloadResponse.arrayBuffer();
		fs.writeFileSync(context.paths.original_operation_file_path, Buffer.from(downloadArrayBuffer));
		Logger.success(`Downloaded GTFS file from URL: ${operationFileData.url}`);

		//
		// Unzip the GTFS file.

		Logger.info({ message: 'Unzipping GTFS file...' });
		await unzipFile(context.paths.original_operation_file_path, context.paths.extracted_dir_path);
		Logger.success(`Unzipped GTFS file from "${context.paths.original_operation_file_path}" to "${context.paths.extracted_dir_path}".`, 1);

		//
		// Update the agency.txt and feed_info.txt files
		// in the extracted directory with normalized data.

		updateAgencyTxtContents(context);

		updateFeedInfoTxtContents(context);

		//
		// Align the shape_id values of trips.txt and shapes.txt with the pattern_id
		// of each trip. Both files are streamed through a temporary working directory,
		// which the zip archive reads from while it is being generated below.

		await rewriteShapeIdsToPatternIds(context);

		Logger.info({ message: `[${planData._id}] trips.txt and shapes.txt shape_id values aligned with pattern_id.` });

		//
		// Zip the exported GTFS files into a single archive.
		// YAZL is used here for its focus on performance and low memory usage.

		const zipTimer = new Timer();

		Logger.info({ message: 'Zipping new GTFS archive...' });

		const outputZip = new ZipFile();

		await new Promise<void>((resolve) => {
		// Read the working directory contents
			const workdirDirContents = fs.readdirSync(context.paths.extracted_dir_path, { withFileTypes: true });
			// Add each file to the zip
			workdirDirContents.forEach((outputDirFile) => {
				const filePath = path.join(context.paths.extracted_dir_path, outputDirFile.name);
				outputZip.addFile(filePath, outputDirFile.name);
			});
			// Setup a write stream to the final zip file
			outputZip.outputStream
				.pipe(fs.createWriteStream(context.paths.new_operation_file_path))
				.on('close', resolve);
			// Finalize the zip creation, which triggers
			// the piping and writing process.
			outputZip.end();
		});

		Logger.success(`Zipped new GTFS archive in ${zipTimer.get()}.`);

		//
		// If there are changes, upload the new GTFS archive to the storage provider.

		const updatedOperationFileBuffer = fs.readFileSync(context.paths.new_operation_file_path);

		const updatedFileResult = await storageProvider.replace(
			updatedOperationFileBuffer,
			{
				...operationFileData,
				size: updatedOperationFileBuffer.byteLength,
			},
			{
				onSuccess: async (_, result) => {
					// Get a new hash for this plan
					const hashValue = await getPlanHash({
						activeFrom: planData.active_from,
						activeUntil: planData.active_until,
						operationFileId: result._id,
						planId: planData._id,
					});
					// Update the plan in the database
					await goDb.operation.plans.updateById(planData._id, {
						hash: hashValue,
						operation_file_id: result._id,
					});
				},
			},
		);

		Logger.info({ message: `[${planData._id}] Operation file updated: ${updatedFileResult.size}` });

		//
		// Cleanup the working directory.

		context.paths.removeDir();

		Logger.success(`Cleaned up working directory.`, 1);

		//
		// Update the last hash of the organizer app for this plan.

		await goDb.operation.plans.updateById(planData._id, {
			'apps.organizer.last_hash': '$hash',
			'apps.organizer.status': 'complete',
			'apps.organizer.timestamp': Dates.now('utc').unix_milliseconds,
		});

		Logger.success(`Updated last hash of organizer app for plan ${planData._id}.`, 1);

		//
	}

	Logger.terminate(`Normalization completed in ${globalTimer.get()}`);
}
