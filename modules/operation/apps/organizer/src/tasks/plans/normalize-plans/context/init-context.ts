/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Agency } from '@tmlmobilidade/go-types-core';
import { Plan } from '@tmlmobilidade/go-types-operation';
import fs from 'node:fs';
import path from 'node:path';

/* * */

export interface NormalizePlansTaskContext {
	data: {
		agency: Agency
		plan: Plan
	}
	paths: {
		base_dir_path: string
		extracted_dir_path: string
		new_operation_file_path: string
		original_operation_file_path: string
		removeDir: () => void
	}
}

/**
 * Initializes the context for the normalize plans task.
 * This function will fetch the agency document for the given plan,
 * create a temporary working directory and all the necessary paths,
 * and return the context.
 * @param planData The plan document to initialize the context for.
 * @returns The initialized context for the normalize plans task.
 * @throws An error if the agency document is not found.
 */
export async function initNormalizePlansTaskContext(planData: Plan): Promise<NormalizePlansTaskContext> {
	//

	//
	// Get the agency document for this plan

	const foundAgencyData = await goDb.core.agencies.findById(planData.agency_id);

	if (!foundAgencyData) {
		throw new Error(`[${planData._id}] No agency found with ID ${planData.agency_id}.`);
	}

	//
	// Create a temporary working directory
	// and all the necessary paths

	const temporaryDirectory = fs.mkdtempDisposableSync(`normalize-plans-task-${planData._id}-`);

	const extractedDirPath = path.join(temporaryDirectory.path, 'extracted');
	const operationFilePath = path.join(temporaryDirectory.path, `${planData._id}-${planData.operation_file_id}.zip`);
	const newOperationFilePath = path.join(temporaryDirectory.path, 'new-operation-file.zip');

	//
	// Return the context

	return {
		data: {
			agency: foundAgencyData,
			plan: planData,
		},
		paths: {
			base_dir_path: temporaryDirectory.path,
			extracted_dir_path: extractedDirPath,
			new_operation_file_path: newOperationFilePath,
			original_operation_file_path: operationFilePath,
			removeDir: temporaryDirectory.remove,
		},
	};
}
