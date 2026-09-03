/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type HashablePlanMetadata } from '@tmlmobilidade/go-types-operation';
import { calculateZipFileHash, unzipFile } from '@tmlmobilidade/go-utils-exec';
import { getTmpWorkdirPath } from '@tmlmobilidade/go-utils-files';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { ZipFile } from 'yazl';

import { getAgencyTxtContents } from './agency.js';
import { getFeedInfoTxtContents } from './feed-info.js';
import { rewriteShapeIdsToPatternIds } from './shapes.js';

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

	const allPlans = await goDb.operation.plans.findMany({ _id: 'XS3H8' });

	Logger.info({ message: `Found ${allPlans.length} plans.` });

	for (const planData of allPlans) {
		//

		Logger.info({ message: `Processing plan ${planData._id}` });

		//
		// Download and unzip the operation file

		if (!planData.operation_file_id) {
			Logger.error({ message: `[${planData._id}] No Operation file ID found.` });
			continue;
		}

		const operationFileData = await storageProvider.findById(planData.operation_file_id);

		if (!operationFileData?.url) {
			Logger.error({ message: `[${planData._id}] Operation file "${planData.operation_file_id}" not found.` });
			continue;
		}

		const workdirPath = getTmpWorkdirPath(planData._id, true);

		Logger.info({ message: `Downloading GTFS file from URL: ${operationFileData.url}` });
		const downloadResponse = await fetch(operationFileData.url);
		const downloadArrayBuffer = await downloadResponse.arrayBuffer();
		fs.writeFileSync(`${workdirPath}/original-gtfs.zip`, Buffer.from(downloadArrayBuffer));
		Logger.success(`Downloaded GTFS file from URL: ${operationFileData.url}`);

		//
		// Unzip the GTFS file.

		Logger.info({ message: 'Unzipping GTFS file...' });
		await unzipFile(`${workdirPath}/original-gtfs.zip`, `${workdirPath}/extracted`);
		Logger.success(`Unzipped GTFS file from "${workdirPath}" to "${workdirPath}/extracted".`, 1);

		//
		// Get the agency document referenced by the plan

		const foundAgencyData = await goDb.core.agencies.findById(planData.agency_id);

		if (!foundAgencyData) {
			Logger.error({ message: `[${planData._id}] No agency found with ID ${planData.agency_id}.` });
			continue;
		}

		//
		// Prepare the output agency.txt file with cleaned data from the Agency
		// collection. Update the agency.txt file in the zip archive.

		const updatedAgencyTxtString = getAgencyTxtContents(foundAgencyData);
		fs.writeFileSync(`${workdirPath}/extracted/agency.txt`, updatedAgencyTxtString);
		Logger.info({ message: `[${planData._id}] agency.txt file updated.` });

		//
		// Prepare the output feed_info.txt file with cleaned data from the plan document
		// and Agency collection. Update the feed_info.txt file in the zip archive.

		const updatedFeedInfoTxtString = getFeedInfoTxtContents(planData, foundAgencyData);
		fs.writeFileSync(`${workdirPath}/extracted/feed_info.txt`, updatedFeedInfoTxtString);
		Logger.info({ message: `[${planData._id}] feed_info.txt file updated.` });

		//
		// Align the shape_id values of trips.txt and shapes.txt with the pattern_id
		// of each trip. Both files are streamed through a temporary working directory,
		// which the zip archive reads from while it is being generated below.

		await rewriteShapeIdsToPatternIds(workdirPath);

		Logger.info({ message: `[${planData._id}] trips.txt and shapes.txt shape_id values aligned with pattern_id.` });

		//
		// Zip the exported GTFS files into a single archive.
		// YAZL is used here for its focus on performance and low memory usage.

		const zipTimer = new Timer();

		Logger.info({ message: 'Zipping new GTFS archive...' });

		const outputZip = new ZipFile();

		await new Promise<void>((resolve) => {
		// Read the working directory contents
			const workdirDirContents = fs.readdirSync(`${workdirPath}/extracted`, { withFileTypes: true });
			// Add each file to the zip
			workdirDirContents.forEach(outputDirFile => outputZip.addFile(`${workdirPath}/extracted/${outputDirFile.name}`, outputDirFile.name));
			// Setup a write stream to the final zip file
			outputZip.outputStream
				.pipe(fs.createWriteStream(`${workdirPath}/new-gtfs.zip`))
				.on('close', resolve);
			// Finalize the zip creation, which triggers
			// the piping and writing process.
			outputZip.end();
		});

		Logger.success(`Zipped new GTFS archive in ${zipTimer.get()}.`);

		//
		// Hash the contents of the original and the new GTFS archives,
		// and compare them to see if there are any changes.

		const originalGtfsHash = await calculateZipFileHash(`${workdirPath}/original-gtfs.zip`);
		const newGtfsHash = await calculateZipFileHash(`${workdirPath}/new-gtfs.zip`);

		if (originalGtfsHash === newGtfsHash) {
			Logger.info({ message: `[${planData._id}] No changes detected in the GTFS archive.` });
			continue;
		}

		//
		// If there are changes, upload the new GTFS archive to the storage provider.

		const updatedOperationFileBuffer = fs.readFileSync(`${workdirPath}/new-gtfs.zip`);

		const updatedFileResult = await storageProvider.replace(updatedOperationFileBuffer, {
			...operationFileData,
			size: updatedOperationFileBuffer.byteLength,
		}, { onSuccess: async (ctx) => {
			//

			//
			// Get a hash of all metadata to make it possible
			// to keep track of changes to the plan.

			const hashablePlanMetadata: HashablePlanMetadata = {
				_id: planData._id,
				active_from: planData.active_from,
				active_until: planData.active_until,
				operation_file_id: ctx.attachmentId,
			};

			const hashValue = createHash('sha256')
				.update(JSON.stringify(hashablePlanMetadata))
				.digest('hex');

			await goDb.operation.plans.updateById(planData._id, {
				hash: hashValue,
				operation_file_id: ctx.attachmentId,
			});
		} });

		Logger.info({ message: `[${planData._id}] Operation file updated: ${updatedFileResult.size}` });

		//
		// Cleanup the working directory.

		fs.rmSync(workdirPath, { recursive: true });

		Logger.success(`Cleaned up working directory "${workdirPath}".`, 1);

		//
	}

	Logger.terminate(`Normalization completed in ${globalTimer.get()}`);

	//
}
