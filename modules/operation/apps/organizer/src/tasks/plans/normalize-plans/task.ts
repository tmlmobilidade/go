/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type HashablePlanMetadata } from '@tmlmobilidade/go-types-operation';
import { Files } from '@tmlmobilidade/go-utils-files';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { createHash } from 'node:crypto';

import { buildAgencyTxt } from './agency.js';
import { buildFeedInfoTxt } from './feed-info.js';
import { applyPatternIdsAsShapeIds, ShapeIdConflictError } from './shapes.js';

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

	const allPlans = await goDb.operation.plans.findMany();

	Logger.info({ message: `Found ${allPlans.length} plans.` });

	for (const planData of allPlans) {
		//

		Logger.info({ message: `Processing plan ${planData._id}` });

		//
		// Check if the plan has the necessary data

		if (!planData.operation_file_id) {
			Logger.error({ message: `[${planData._id}] No Operation file ID found.` });
			continue;
		}

		if (!planData.active_from || !planData.active_until) {
			Logger.error({ message: `[${planData._id}] Plan has no start and end dates.` });
			continue;
		}

		//
		// Download and unzip the operation file

		const operationFileData = await storageProvider.findById(planData.operation_file_id);

		if (!operationFileData?.url) {
			Logger.error({ message: `[${planData._id}] Operation file "${planData.operation_file_id}" not found.` });
			continue;
		}

		const operationFileZipInstance = await Files.unzip(operationFileData.url);

		Logger.info({ message: `[${planData._id}] Operation file "${operationFileData._id}" downloaded and unzipped.` });

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

		let agencyTxtChanged = false;

		const updatedAgencyTxtString = buildAgencyTxt(foundAgencyData);
		const originalAgencyTxtString = await operationFileZipInstance.file('agency.txt')?.async('string');

		if (originalAgencyTxtString !== updatedAgencyTxtString) {
			agencyTxtChanged = true;
			operationFileZipInstance.file('agency.txt', updatedAgencyTxtString);
			Logger.info({ message: `[${planData._id}] agency.txt file updated.` });
		} else {
			Logger.info({ message: `[${planData._id}] agency.txt file is already up to date.` });
		}

		//
		// Prepare the output feed_info.txt file with cleaned data from the plan document
		// and Agency collection. Update the feed_info.txt file in the zip archive.

		let feedInfoTxtChanged = false;

		const updatedFeedInfoTxtString = buildFeedInfoTxt(planData, foundAgencyData);
		const originalFeedInfoTxtString = await operationFileZipInstance.file('feed_info.txt')?.async('string');

		if (originalFeedInfoTxtString !== updatedFeedInfoTxtString) {
			feedInfoTxtChanged = true;
			operationFileZipInstance.file('feed_info.txt', updatedFeedInfoTxtString);
			Logger.info({ message: `[${planData._id}] feed_info.txt file updated.` });
		} else {
			Logger.info({ message: `[${planData._id}] feed_info.txt file is already up to date.` });
		}

		//
		// Align the shape_id values of trips.txt and shapes.txt with the pattern_id
		// of each trip. A conflicting relation leaves both files untouched.

		let shapeIdsChanged = false;

		const originalTripsTxtString = await operationFileZipInstance.file('trips.txt')?.async('string');
		const originalShapesTxtString = await operationFileZipInstance.file('shapes.txt')?.async('string');

		if (!originalTripsTxtString || !originalShapesTxtString) {
			Logger.error({ message: `[${planData._id}] Missing trips.txt or shapes.txt. Skipping shape_id alignment.` });
		} else {
			try {
				const updatedGtfsShapes = await applyPatternIdsAsShapeIds(originalTripsTxtString, originalShapesTxtString);

				if (!updatedGtfsShapes) {
					Logger.info({ message: `[${planData._id}] No pattern_id values found in trips.txt. Skipping shape_id alignment.` });
				} else if (updatedGtfsShapes.tripsCsvString !== originalTripsTxtString || updatedGtfsShapes.shapesCsvString !== originalShapesTxtString) {
					shapeIdsChanged = true;
					operationFileZipInstance.file('trips.txt', updatedGtfsShapes.tripsCsvString);
					operationFileZipInstance.file('shapes.txt', updatedGtfsShapes.shapesCsvString);
					Logger.info({ message: `[${planData._id}] trips.txt and shapes.txt shape_id values aligned with pattern_id.` });
				} else {
					Logger.info({ message: `[${planData._id}] shape_id values are already aligned with pattern_id.` });
				}
			} catch (error) {
				if (!(error instanceof ShapeIdConflictError)) throw error;
				Logger.error({ error, message: `[${planData._id}] Conflicting shape_id and pattern_id relation. Skipping shape_id alignment.` });
			}
		}

		//
		// Re-zip and upload the updated operation file

		let updatedFileResult = operationFileData;

		if (agencyTxtChanged || feedInfoTxtChanged || shapeIdsChanged) {
			const updatedOperationFileArrayBuffer = await operationFileZipInstance.generateAsync({ compression: 'DEFLATE', compressionOptions: { level: 9 }, type: 'arraybuffer' });
			const updatedOperationFileBuffer = Buffer.from(updatedOperationFileArrayBuffer);
			updatedFileResult = await storageProvider.replace(updatedOperationFileBuffer, { ...operationFileData, size: updatedOperationFileBuffer.byteLength });
			Logger.info({ message: `[${planData._id}] Operation file updated: ${updatedFileResult.size}` });
		}

		//
		// Get a hash of all metadata to make it possible
		// to keep track of changes to the plan.

		const hashablePlanMetadata: HashablePlanMetadata = {
			_id: planData._id,
			active_from: planData.active_from,
			active_until: planData.active_until,
			operation_file_id: updatedFileResult._id,
		};

		const hashValue = createHash('sha256')
			.update(JSON.stringify(hashablePlanMetadata))
			.digest('hex');

		await goDb.operation.plans.updateById(planData._id, {
			hash: hashValue,
			operation_file_id: updatedFileResult._id,
		});

		//
	}

	Logger.terminate(`Normalization completed in ${globalTimer.get()}`);

	//
}
