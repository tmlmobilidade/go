/* * */

import { setRidesAsWaiting } from '@tmlmobilidade/go-apex-pckg-callback';
import { parseRawApexTransactionRefundV30IntoSimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-apex-pckg-parsers';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RawApexTransaction, type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-types-apex';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { type ChangeStreamDocument } from 'mongodb';
import { ZodError } from 'zod';

/* * */

const writer = new BatchWriter<SimplifiedApexOnBoardRefund>({
	batch_size: 10_000,
	batch_timeout: 30_000,
	insertFn: async (data) => {
		await labDb.simplifiedApex.refunds.insert('JSONEachRow', data);
	},
	title: await labDb.simplifiedApex.refunds.getTableName(),
});

/**
 * Process the APEX Refund database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexRefunds collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Refund document to be processed.
 * @returns A promise that resolves when the APEX Refund document has been processed.
 */
export async function processRawApexTransactionRefund(databaseOperation: ChangeStreamDocument<RawApexTransaction>) {
	//

	//
	// Validate that the operation carries a full document.
	// Only insert operations are expected to occur in this collection.

	if (!('fullDocument' in databaseOperation) || !databaseOperation.fullDocument) return;

	//
	// Transform the APEX Refund document into a SimplifiedApexOnBoardRefund
	// and write it to the database, using a batch writer.

	try {
		let parseResult: null | SimplifiedApexOnBoardRefund = null;
		if (databaseOperation.fullDocument.version === 'refund-3.0') parseResult = parseRawApexTransactionRefundV30IntoSimplifiedApexOnBoardRefund(databaseOperation.fullDocument);
		if (!parseResult) return;
		await writer.write(parseResult, { flushCallback: setRidesAsWaiting });
	} catch (error) {
		const errorMessage = error instanceof ZodError
			? error.issues.map(issue => `${issue.path.join('.')} ${issue.message}`).join('; ')
			: error instanceof Error ? error.message : String(error);
		Logger.error({ message: `Error transforming APEX Refund: ${databaseOperation.fullDocument._id}: Reason: ${errorMessage}` });
	}

	//
};
