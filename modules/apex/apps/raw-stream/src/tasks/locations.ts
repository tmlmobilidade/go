/* * */

import { setRidesAsWaiting } from '@tmlmobilidade/go-apex-pckg-callback';
import { parseRawApexTransactionLocationV30IntoSimplifiedApexLocation } from '@tmlmobilidade/go-apex-pckg-parsers';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RawApexTransaction, type SimplifiedApexLocation } from '@tmlmobilidade/go-types-apex';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { type ChangeStreamDocument } from 'mongodb';
import { ZodError } from 'zod';

/* * */

const writer = new BatchWriter<SimplifiedApexLocation>({
	batch_size: 10_000,
	batch_timeout: 30_000,
	insertFn: async (data) => {
		await labDb.simplifiedApex.locations.insert('JSONEachRow', data);
	},
	title: await labDb.simplifiedApex.locations.getTableName(),
});

/**
 * Process the APEX Location database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexLocations collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Location document to be processed.
 * @returns A promise that resolves when the APEX Location document has been processed.
 */
export async function processRawApexTransactionLocation(databaseOperation: ChangeStreamDocument<RawApexTransaction>) {
	//

	//
	// Validate that the operation carries a full document.
	// Only insert operations are expected to occur in this collection.

	if (!('fullDocument' in databaseOperation) || !databaseOperation.fullDocument) return;

	//
	// Transform the APEX Location document into a SimplifiedApexLocation
	// and write it to the database, using a batch writer.

	try {
		let parseResult: null | SimplifiedApexLocation = null;
		if (databaseOperation.fullDocument.version === 'location-3.0') parseResult = parseRawApexTransactionLocationV30IntoSimplifiedApexLocation(databaseOperation.fullDocument);
		if (!parseResult) return;
		await writer.write(parseResult, { flushCallback: setRidesAsWaiting });
	} catch (error) {
		const errorMessage = error instanceof ZodError
			? error.issues.map(issue => `${issue.path.join('.')} ${issue.message}`).join('; ')
			: error instanceof Error ? error.message : String(error);
		Logger.error({ message: `Error transforming APEX Location: ${databaseOperation.fullDocument._id}: Reason: ${errorMessage}` });
	}

	//
};
