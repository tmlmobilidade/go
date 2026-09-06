/* * */

import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type HashablePlanMetadata } from '@tmlmobilidade/go-types-operation';
import { OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { getZipFileHash } from '@tmlmobilidade/go-utils-exec';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/* * */

interface GetPlanHashParams {
	activeFrom: OperationalDateInt
	activeUntil: OperationalDateInt
	operationAttachmentId: string
	operationNormalizedAttachmentId: string
	planId: string
}

/**
 * Get the hash of a plan
 * @param params - The parameters for the function
 * @returns The hash of the plan
 */
export async function getPlanHash({ activeFrom, activeUntil, operationAttachmentId, operationNormalizedAttachmentId, planId }: GetPlanHashParams): Promise<string> {
	//

	//
	// Check if all necessary data is present

	if (!activeFrom) throw new Error(`[getPlanHash()] No active_from date received for plan ${planId}`);

	if (!activeUntil) throw new Error(`[getPlanHash()] No active_until date received for plan ${planId}`);

	if (!operationAttachmentId) throw new Error(`[getPlanHash()] No Operation attachment ID received for plan ${planId}`);

	if (!operationNormalizedAttachmentId) throw new Error(`[getPlanHash()] No Operation normalized attachment ID received for plan ${planId}`);

	//
	// Retrieve the operation and the normalized operation attachments from the storage provider

	const operationAttachmentData = await storageProvider.findById(operationAttachmentId);

	if (!operationAttachmentData?.url) {
		throw new Error(`[getPlanHash()] Operation attachment "${operationAttachmentId}" not found in Storage for plan ${planId}`);
	}

	const operationNormalizedAttachmentData = await storageProvider.findById(operationNormalizedAttachmentId);

	if (!operationNormalizedAttachmentData?.url) {
		throw new Error(`[getPlanHash()] Operation normalized attachment "${operationNormalizedAttachmentId}" not found in Storage for plan ${planId}`);
	}

	//
	// Initialize a new temporary directory

	const temporaryDirectory = fs.mkdtempDisposableSync('get-plan-hash-');

	try {
		//
		// Download the operation file from the storage provider
		// and calculate the hash of the operation file.

		const downloadResponse = await fetch(operationAttachmentData.url);
		const downloadArrayBuffer = await downloadResponse.arrayBuffer();
		const downloadFilePath = path.join(temporaryDirectory.path, 'gtfs.zip');

		fs.writeFileSync(downloadFilePath, Buffer.from(downloadArrayBuffer));

		const operationAttachmentHash = await getZipFileHash(downloadFilePath);

		//
		// Download the normalized operation attachment from the storage provider
		// and calculate the hash of the normalized operation file.

		const downloadNormalizedResponse = await fetch(operationNormalizedAttachmentData.url);
		const downloadNormalizedArrayBuffer = await downloadNormalizedResponse.arrayBuffer();
		const downloadNormalizedFilePath = path.join(temporaryDirectory.path, 'gtfs-normalized.zip');

		fs.writeFileSync(downloadNormalizedFilePath, Buffer.from(downloadNormalizedArrayBuffer));

		const operationNormalizedAttachmentHash = await getZipFileHash(downloadNormalizedFilePath);

		//
		// Create a hashable plan metadata object

		const hashablePlanMetadata: HashablePlanMetadata = {
			_id: planId,
			active_from: activeFrom,
			active_until: activeUntil,
			operation_attachment_hash: operationAttachmentHash,
			operation_normalized_attachment_hash: operationNormalizedAttachmentHash,
		};

		//
		// Create a SHA-256 hash of the hashable plan metadata object and return it

		const hashValue = createHash('sha256')
			.update(JSON.stringify(hashablePlanMetadata))
			.digest('hex');

		return hashValue;

		//
	} finally {
		temporaryDirectory.remove();
	}
}
