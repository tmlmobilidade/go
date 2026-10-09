/* * */

import { type ExtractionTaskContext, type ExtractionTaskResult, type InfrastructureStopsV1Extraction } from '@tmlmobilidade/go-types-extractions';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import fs from 'node:fs';
import path from 'node:path';

import { buildExtractV1 } from '../../../build-extract-v1.js';

/**
 * Exports a batch of stops to a CSV file.
 * @param fileExport - The file export object.
 * @returns The path to the exported file.
 */
export async function extractInfrastructureStopsV1(context: ExtractionTaskContext, extraction: InfrastructureStopsV1Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// Prepare the shared filters and permissions

	await buildExtractV1(extraction);

	//
	// Setup a temporary directory and a batch writer

	const temporaryDirectory = fs.mkdtempDisposableSync('infrastructure-stops-v1-');

	// const writer = new BatchWriter({
	// 	batch_size: 100_000,
	// 	insertFn: async (data) => {
	// 		const dirPath = path.join(temporaryDirectory.path, 'stops.csv');
	// 		const fileAlreadyExists = fs.existsSync(dirPath);
	// 		const csvData = csvStringify(data, { header: !fileAlreadyExists });
	// 		fs.appendFileSync(dirPath, csvData, { encoding: 'utf-8', flush: true });
	// 	},
	// 	title: 'calendar_dates',
	// });

	//
	// Export the stops to a CSV file

	return;
}
