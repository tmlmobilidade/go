/* * */

import { Files } from '@tmlmobilidade/files';
import { agencies, files, plans } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GtfsAgency, type GtfsFeedInfo, HashablePlanMetadata } from '@tmlmobilidade/types';
import { createHash } from 'node:crypto';
import Papa from 'papaparse';

/**
 * This script makes sure the associated GTFS files of plan documents
 * have the correct feed_info.txt and agency.txt information.
 * This will download the zip archive, unzip it, check and update the
 * necessary files, re-zip it and upload it again, for each plan document.
 */
export async function ensureGtfsFiles() {
	//

	Logger.info('Task disabled.');
	return;

	Logger.init();

	const globalTimer = new Timer();

	const allPlans = await plans.all();

	for (const planData of allPlans) {
		//

		Logger.info(`Processing plan ${planData._id}`);

		//
		// Check if plan has necessary data

		if (!planData.operation_file_id) {
			Logger.error(`[${planData._id}] No Operation file ID found.`);
			continue;
		}

		if (!planData.gtfs_feed_info.feed_start_date && !planData.gtfs_feed_info.feed_end_date) {
			Logger.error(`[${planData._id}] Plan has no start and end dates.`);
			continue;
		}

		//
		// Download and unzip operation file

		const operationFileData = await files.findById(planData.operation_file_id);

		const operationFileZipInstance = await Files.unzip(operationFileData.url);

		Logger.info(`[${planData._id}] Operation file "${operationFileData._id}" downloaded and unzipped.`);

		//
		// Prepare the output agency.txt file with cleaned data from the plan document
		// and Agency collection. Update the agency.txt file in the zip archive.

		let agencyTxtChanged = false;

		const foundAgencyData = await agencies.findById(planData.gtfs_agency.agency_id);

		if (!foundAgencyData) {
			Logger.error(`[${planData._id}] No agency found with ID ${planData.gtfs_agency.agency_id}.`);
			continue;
		}

		const updatedAgencyTxtData: GtfsAgency = {
			agency_email: foundAgencyData.public_email,
			agency_fare_url: foundAgencyData.fare_url,
			agency_id: foundAgencyData._id,
			agency_lang: 'pt',
			agency_name: foundAgencyData.name,
			agency_phone: foundAgencyData.phone,
			agency_timezone: foundAgencyData.timezone,
			agency_url: foundAgencyData.website_url,
		};

		const updateAgencyTxtString = Papa.unparse([updatedAgencyTxtData]);

		const originalAgencyTxtString = await operationFileZipInstance.file('agency.txt').async('string');

		operationFileZipInstance.file('agency.txt', updateAgencyTxtString);
		Logger.info(`[${planData._id}] agency.txt file updated.`);

		if (originalAgencyTxtString !== updateAgencyTxtString) {
			agencyTxtChanged = true;
			operationFileZipInstance.file('agency.txt', updateAgencyTxtString);
			Logger.info(`[${planData._id}] agency.txt file updated.`);
		}
		else {
			Logger.info(`[${planData._id}] agency.txt file is already up to date.`);
		}

		//
		// Prepare the output feed_info.txt file with cleaned data from the plan document
		// and Agency collection. Update the feed_info.txt file in the zip archive.

		let feedInfoTxtChanged = false;

		const updatedFeedInfoTxtData: GtfsFeedInfo = {
			default_lang: 'pt',
			feed_contact_email: foundAgencyData.public_email,
			feed_contact_url: foundAgencyData.website_url,
			feed_end_date: planData.gtfs_feed_info.feed_end_date,
			feed_lang: 'pt',
			feed_publisher_name: foundAgencyData.name,
			feed_publisher_url: foundAgencyData.website_url,
			feed_start_date: planData.gtfs_feed_info.feed_start_date,
			feed_version: planData._id,
		};

		const updatedFeedInfoTxtString = Papa.unparse([updatedFeedInfoTxtData]);

		const originalFeedInfoTxtString = await operationFileZipInstance.file('feed_info.txt').async('string');

		if (originalFeedInfoTxtString !== updatedFeedInfoTxtString) {
			feedInfoTxtChanged = true;
			operationFileZipInstance.file('feed_info.txt', updatedFeedInfoTxtString);
			Logger.info(`[${planData._id}] feed_info.txt file updated.`);
		}
		else {
			Logger.info(`[${planData._id}] feed_info.txt file is already up to date.`);
		}

		//
		// Re-zip and upload updated operation file

		let updateFileResult = operationFileData;

		if (agencyTxtChanged || feedInfoTxtChanged === false) {
			const updatedOperationFileArrayBuffer = await operationFileZipInstance.generateAsync({ compression: 'DEFLATE', compressionOptions: { level: 9 }, type: 'arraybuffer' });
			updateFileResult = await files.upload(Buffer.from(updatedOperationFileArrayBuffer), operationFileData, { override: true });
			Logger.info(`[${planData._id}] Operation file updated: ${updateFileResult.size}`);
		}

		//
		// Get a hash of all metadata to make it possible
		// to keep track of changes to the plan.

		const hashablePlanMetadata: HashablePlanMetadata = {
			_id: planData._id,
			gtfs_agency: updatedAgencyTxtData,
			gtfs_feed_info: updatedFeedInfoTxtData,
			operation_file_id: updateFileResult._id,
		};

		const hashValue = createHash('sha256')
			.update(JSON.stringify(hashablePlanMetadata))
			.digest('hex');

		await plans.updateById(planData._id, {
			gtfs_agency: updatedAgencyTxtData,
			gtfs_feed_info: updatedFeedInfoTxtData,
			hash: hashValue,
			operation_file_id: updateFileResult._id,
		});

		//
	}

	Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);

	//
}
