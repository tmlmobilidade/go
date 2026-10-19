/* * */

import { preparePositionalQueryParams } from '@tmlmobilidade/go-clients-clickhouse';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OperationRidesV2Extraction, OperationRidesV2ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { getSqlAndParams } from './apply-query.js';
import { toOutputRow } from './transform.js';
import { type OperationRidesV2QueryRow } from './types.js';

/**
 * Exports the rides matching the given filters to a CSV file.
 * @param context The extraction task context.
 * @param extraction The extraction to run.
 */
export async function operationRidesV2Extraction(context: ExtractionTaskContext, extraction: OperationRidesV2Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// Validate the received properties

	const validatedProperties = OperationRidesV2ExtractionPropertiesSchema.parse(extraction.properties);

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
	// Build the query. There is nothing to extract when the filters
	// cannot match any ride, so no file is produced.

	const query = getSqlAndParams(validatedProperties);

	if (!query) return;

	//
	// Setup a batch writer.
	//
	// Batches are written as whole units, so the acceptance of every ride in the
	// batch is fetched with a single query, instead of one query per ride.

	const fileName = `operation-rides-v2-${extraction._id}.csv`;

	const writer = new BatchWriter<OperationRidesV2QueryRow>({
		batch_size: 10_000,
		insertFn: async (rows) => {
			const acceptances = await goDb.operation.rideAcceptances.findMany({ _id: { $in: rows.map(row => row._id) } });
			const acceptanceByRideId = new Map(acceptances.map(acceptance => [acceptance._id, acceptance]));
			const outputRows = rows.map(row => toOutputRow(row, acceptanceByRideId.get(row._id) ?? null));
			const filePath = path.join(context.output_path, fileName);
			const fileAlreadyExists = fs.existsSync(filePath);
			const csvData = csvStringify(outputRows, { header: !fileAlreadyExists });
			fs.appendFileSync(filePath, csvData, { encoding: 'utf-8', flush: true });
		},
		title: 'operation-rides-v2',
	});

	//
	// Get the rides from the database

	const client = await labDb.getClient();

	const preparedQuery = preparePositionalQueryParams(query.sql, query.params);

	const queryResult = await client.query({
		format: 'JSONEachRow',
		query: preparedQuery.query,
		query_params: preparedQuery.query_params,
	});

	const stream = queryResult.stream<OperationRidesV2QueryRow>();

	for await (const chunk of stream) {
		await writer.write(chunk.map(row => row.json()));
	}

	await writer.flush();

	return;
}
