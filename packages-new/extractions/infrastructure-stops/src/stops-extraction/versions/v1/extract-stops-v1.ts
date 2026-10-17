/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type InfrastructureStopsV1Extraction } from '@tmlmobilidade/go-types-extractions';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { buildStopsExtractionQuery } from './apply-query.js';
import { parseStopsExtraction } from './transform.js';
import { type InfrastructureStopsV1OutputRow, type InfrastructureStopsV1QueryRow } from './types.js';

/* * */

const columns = [
	'_id',
	'jurisdiction',
	'legacy_id',
	'legacy_ids',
	'lifecycle_status',
	'name',
	'new_name',
	'previous_go_id',
	'short_name',
	'tts_name',
	'observations',
	'district_id',
	'latitude',
	'locality_id',
	'longitude',
	'municipality_name',
	'municipality_id',
	'parish_id',
	'shelter_code',
	'shelter_installation_date',
	'shelter_maintainer',
	'shelter_make',
	'shelter_model',
	'shelter_status',
	'connections',
	'facilities',
] satisfies (keyof InfrastructureStopsV1OutputRow)[];

/* * */

/**
 * Exports the permitted stops matching the filters to stops.csv.
 * @param context The extraction task context.
 * @param extraction The extraction to run.
 */
export async function extractInfrastructureStopsV1(context: ExtractionTaskContext, extraction: InfrastructureStopsV1Extraction): Promise<ExtractionTaskResult> {
	// A. Prepare the query and open the stop cursor

	const { filter, projection } = await buildStopsExtractionQuery(extraction);
	const collection = await goDb.infrastructure.stops.getCollection();
	const cursor = collection.find<InfrastructureStopsV1QueryRow>(filter, { batchSize: 5_000, projection, sort: { _id: 1 } });

	try {
		// B. Write the CSV header and set up the batch writer

		const filePath = path.join(context.output_path, 'stops.csv');
		const header = csvStringify([], { bom: true, columns, header: true });
		fs.writeFileSync(filePath, header, { encoding: 'utf-8', flush: true });

		const writer = new BatchWriter<InfrastructureStopsV1QueryRow>({
			batch_size: 10_000,
			insertFn: async (rows) => {
				const outputRows = rows.map(parseStopsExtraction);
				const csv = csvStringify(outputRows, { columns });
				fs.appendFileSync(filePath, csv, { encoding: 'utf-8', flush: true });
			},
			// Retrying a partial append could duplicate rows in the CSV.
			max_retries: 0,
			title: 'infrastructure-stops-v1',
		});

		// C. Export stops and flush the final batch

		for await (const stop of cursor) {
			await writer.write(stop);
		}

		await writer.flush();
	} finally {
		await cursor.close();
	}
}
