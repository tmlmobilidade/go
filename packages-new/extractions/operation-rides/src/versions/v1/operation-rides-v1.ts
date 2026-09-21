/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OperationRidesV1Extraction, OperationRidesV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { getSqlAndParams } from './apply-query.js';
import { toOutputRow } from './transform.js';
import { OperationRidesV1QueryRow } from './types.js';

/**
 * Exports a batch of stops to a CSV file.
 * @param fileExport - The file export object.
 * @returns The path to the exported file.
 */
export async function operationRidesV1Extraction(context: ExtractionTaskContext, extraction: OperationRidesV1Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// Validate the received properties

	const validatedProperties = OperationRidesV1ExtractionPropertiesSchema.parse(extraction.properties);

	//
	// Adjust properties to match user permissions

	const userPermissions = await authProvider.getPermissionsFromUserId(extraction.created_by);

	validatedProperties.agency_ids = filterPermissionResourceValues<string>({
		action: 'analysis_read',
		permissions: userPermissions,
		resourceKey: 'agency_ids',
		scope: 'rides',
		values: validatedProperties.agency_ids,
	});

	//
	// Setup a temporary directory and a batch writer

	const fileName = `operation-rides-v1-${extraction._id}.csv`;

	const writer = new BatchWriter({
		batch_size: 100_000,
		insertFn: async (data) => {
			const filePath = path.join(context.output_path, fileName);
			const fileAlreadyExists = fs.existsSync(filePath);
			const csvData = csvStringify(data, { header: !fileAlreadyExists });
			fs.appendFileSync(filePath, csvData, { encoding: 'utf-8', flush: true });
		},
		title: 'operation-rides-v1',
	});

	//
	// Get the stops from the database

	const { params, sql } = getSqlAndParams(validatedProperties);

	const client = await labDb.getClient();

	const queryResult = await client.query({
		format: 'JSONEachRow',
		query: sql,
		query_params: params,
	});

	const stream = queryResult.stream<OperationRidesV1QueryRow>();

	for await (const chunk of stream) {
		const rows = chunk.map(row => toOutputRow(row.json()));
		await writer.write(rows);
	}

	await writer.flush();

	//
	// Export the stops to a CSV file

	return;
}
