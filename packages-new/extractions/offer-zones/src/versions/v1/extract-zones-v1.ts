/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OfferZonesV1Extraction } from '@tmlmobilidade/go-types-extractions';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { normalizeString } from '@tmlmobilidade/strings';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { buildZonesExtractionQuery } from './apply-query.js';
import { parseZonesExtraction } from './transform.js';
import { type OfferZonesV1OutputRow, OfferZonesV1OutputRowSchema } from './types.js';

/**
 * Exports the permitted zones matching the list filters to a CSV file.
 * @param context The extraction task context.
 * @param extraction The extraction to run.
 */
export async function extractOfferZonesV1(context: ExtractionTaskContext, extraction: OfferZonesV1Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// Prepare filters, current permissions and list search

	const { normalizedSearch, pipeline } = await buildZonesExtractionQuery(extraction);
	const foundZones = await goDb.offer.zones.aggregate(pipeline);

	//
	// Write the header even when no zones match the filters

	const csvColumns = ['_id', 'code', 'name', 'agency_ids'] satisfies (keyof OfferZonesV1OutputRow)[];
	const fileName = `offer-zones-v1-${extraction._id}.csv`;
	const outputFilePath = path.join(context.output_path, fileName);
	const csvHeader = csvStringify([], { columns: csvColumns, header: true });

	fs.writeFileSync(outputFilePath, csvHeader, { encoding: 'utf-8', flush: true });

	const csvWriter = new BatchWriter<OfferZonesV1OutputRow>({
		batch_size: 100_000,
		insertFn: async (outputRows) => {
			const csvData = csvStringify(outputRows, {
				cast: {
					// Match alert exports: keep each record on a single CSV line.
					string: cellValue => cellValue.replaceAll(/[\r\n\u2028\u2029]+/g, ' '),
				},
				columns: csvColumns,
				header: false,
			});
			fs.appendFileSync(outputFilePath, csvData, { encoding: 'utf-8', flush: true });
		},
		// Retrying a partially written append could duplicate rows.
		max_retries: 0,
		title: 'offer_zones_v1',
	});

	//
	// Apply the same accessor search as useSearch before formatting CSV cells

	for (const foundZone of foundZones) {
		if (normalizedSearch) {
			const searchValues = [foundZone._id, foundZone.name, foundZone.code, foundZone.agency_ids];
			// useSearch normalizes each accessor's toString(), including comma-separated arrays.
			const matchesSearch = searchValues.some(value => value && normalizeString(value.toString()).includes(normalizedSearch));

			if (!matchesSearch) continue;
		}

		const outputRow = parseZonesExtraction(foundZone);
		const validatedOutputRow = OfferZonesV1OutputRowSchema.parse(outputRow);

		await csvWriter.write(validatedOutputRow);
	}

	await csvWriter.flush();
}
