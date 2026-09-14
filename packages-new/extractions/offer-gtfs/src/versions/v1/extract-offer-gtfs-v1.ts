/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { ExtractionTaskContext, ExtractionTaskResult, OfferGtfsV29Extraction, OfferGtfsV29ExtractionPropertiesSchema, OfferGtfsV29ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Exports a batch of offer GTFS data to a CSV file.
 * @param fileExport - The file export object.
 * @returns The path to the exported file.
 */
export async function extractOfferGtfsV1(context: ExtractionTaskContext, extraction: OfferGtfsV29Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// Validate the received properties

	const validatedProperties = OfferGtfsV29ExtractionPropertiesSchema.parse(extraction.properties);

	//
	// Setup a temporary directory and a batch writer

	const temporaryDirectory = fs.mkdtempDisposableSync(`${OfferGtfsV29ExtractionVersionValue}-`);

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
	// Get the stops from the database

	const foundStops = await goDb.infrastructure.stops.findMany({
		municipality_id: { in: validatedProperties.municipality_ids },
	});

	//
	// Export the stops to a CSV file

	return;
}
