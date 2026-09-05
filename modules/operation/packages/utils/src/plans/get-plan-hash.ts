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
	operationFileId: string
	planId: string
}

/**
 * Get the hash of a plan
 * @param params - The parameters for the function
 * @returns The hash of the plan
 */
export async function getPlanHash({ activeFrom, activeUntil, operationFileId, planId }: GetPlanHashParams): Promise<string> {
	//

	//
	// Check if all necessary data is present

	if (!activeFrom) throw new Error(`[getPlanHash()] No active_from date received for plan ${planId}`);

	if (!activeUntil) throw new Error(`[getPlanHash()] No active_until date received for plan ${planId}`);

	if (!operationFileId) throw new Error(`[getPlanHash()] No Operation file ID received for plan ${planId}`);

	//
	// Retrieve the operation file data from the storage provider

	const operationFileData = await storageProvider.findById(operationFileId);

	if (!operationFileData?.url) {
		throw new Error(`[getPlanHash()] Operation file "${operationFileId}" not found in Storage for plan ${planId}`);
	}

	//
	// Initialize a new temporary directory

	const temporaryDirectory = fs.mkdtempDisposableSync('get-plan-hash-');

	try {
		//
		// Download the operation file from the storage provider
		// and calculate the hash of the operation file.

		const downloadResponse = await fetch(operationFileData.url);
		const downloadArrayBuffer = await downloadResponse.arrayBuffer();
		const downloadFilePath = path.join(temporaryDirectory.path, 'gtfs.zip');

		fs.writeFileSync(downloadFilePath, Buffer.from(downloadArrayBuffer));

		const operationFileHash = await getZipFileHash(downloadFilePath);

		//
		// Create a hashable plan metadata object

		const hashablePlanMetadata: HashablePlanMetadata = {
			_id: planId,
			active_from: activeFrom,
			active_until: activeUntil,
			operation_file_hash: operationFileHash,
			operation_file_id: operationFileId,
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
