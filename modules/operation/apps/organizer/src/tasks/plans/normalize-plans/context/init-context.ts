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
		operation_gtfs_file_path: string
		operation_gtfs_normalized_file_path: string
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
	const operationGtfsFilePath = path.join(temporaryDirectory.path, `${planData._id}-${planData.attachments.operation_gtfs}.zip`);
	const operationGtfsNormalizedFilePath = path.join(temporaryDirectory.path, `${planData._id}-gtfs-normalized.zip`);

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
			operation_gtfs_file_path: operationGtfsFilePath,
			operation_gtfs_normalized_file_path: operationGtfsNormalizedFilePath,
			removeDir: temporaryDirectory.remove,
		},
	};
}
