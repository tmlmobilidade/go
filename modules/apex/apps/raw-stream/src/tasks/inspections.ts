/* * */

import { parseRawApexTransactionInspectionV20IntoSimplifiedApexInspection } from '@tmlmobilidade/go-apex-pckg-parsers';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RawApexTransaction, type SimplifiedApexInspection } from '@tmlmobilidade/go-types-apex';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { type ChangeStreamDocument } from 'mongodb';
import { ZodError } from 'zod';

/* * */

const writer = new BatchWriter<SimplifiedApexInspection>({
	batch_size: 10_000,
	batch_timeout: 30_000,
	insertFn: async (data) => {
		await labDb.simplifiedApex.inspections.insert('JSONEachRow', data);
	},
	title: await labDb.simplifiedApex.inspections.getTableName(),
});

/**
 * Process the APEX Inspection database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexInspections collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Inspection document to be processed.
 * @returns A promise that resolves when the APEX Inspection document has been processed.
 */
export async function processRawApexTransactionInspection(databaseOperation: ChangeStreamDocument<RawApexTransaction>) {
	//

	//
	// Validate that the operation carries a full document.
	// Only insert operations are expected to occur in this collection.

	if (!('fullDocument' in databaseOperation) || !databaseOperation.fullDocument) return;

	//
	// Transform the APEX Inspection document into a SimplifiedApexInspection
	// and write it to the database, using a batch writer.

	try {
		let parseResult: null | SimplifiedApexInspection = null;
		if (databaseOperation.fullDocument.version === 'inspection-2.0') parseResult = parseRawApexTransactionInspectionV20IntoSimplifiedApexInspection(databaseOperation.fullDocument);
		if (!parseResult) return;
		await writer.write(parseResult);
	} catch (error) {
		const errorMessage = error instanceof ZodError
			? error.issues.map(issue => `${issue.path.join('.')} ${issue.message}`).join('; ')
			: error instanceof Error ? error.message : String(error);
		Logger.error({ message: `Error transforming APEX Inspection: ${databaseOperation.fullDocument._id}: Reason: ${errorMessage}` });
	}

	//
};
