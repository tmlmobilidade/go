/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OfferZonesV1Extraction } from '@tmlmobilidade/go-types-extractions';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { buildZonesExtractionQuery } from './apply-query.js';
import { parseZonesExtraction } from './transform.js';
import { type OfferZonesV1OutputRow, type OfferZonesV1QueryRow } from './types.js';

/* * */

const columns: (keyof OfferZonesV1OutputRow)[] = ['_id', 'code', 'name', 'agency_ids'];

/**
 * Exports the selected, permitted zones to zones.csv.
 * @param context The extraction task context.
 * @param extraction The extraction to run.
 */
export async function extractOfferZonesV1(context: ExtractionTaskContext, extraction: OfferZonesV1Extraction): Promise<ExtractionTaskResult> {
	const { filter, projection } = await buildZonesExtractionQuery(extraction);
	const collection = await goDb.offer.zones.getCollection();
	const cursor = collection.find<OfferZonesV1QueryRow>(filter, { batchSize: 5_000, projection, sort: { _id: 1 } });

	try {
		const filePath = path.join(context.output_path, 'zones.csv');
		fs.writeFileSync(filePath, csvStringify([], { bom: true, columns, header: true }), { encoding: 'utf-8', flush: true });

		const writer = new BatchWriter<OfferZonesV1OutputRow>({
			batch_size: 10_000,
			insertFn: async (rows) => {
				fs.appendFileSync(filePath, csvStringify(rows, { columns, header: false }), { encoding: 'utf-8', flush: true });
			},
			// An append may fail after writing bytes; retry the whole extraction instead.
			max_retries: 0,
			title: 'offer-zones-v1',
		});

		for await (const zone of cursor) {
			await writer.write(parseZonesExtraction(zone));
		}

		await writer.flush();
	} finally {
		await cursor.close();
	}
}
