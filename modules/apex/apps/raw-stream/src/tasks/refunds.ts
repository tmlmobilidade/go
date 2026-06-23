/* * */

import { simplifiedApexOnBoardRefundsNew } from '@tmlmobilidade/databases';
import { parseRawApexTransactionRefundV30IntoSimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedApexOnBoardRefund>({
	batch_size: 10_000,
	batch_timeout: 30_000,
	insertFn: async (data) => {
		await simplifiedApexOnBoardRefundsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexOnBoardRefundsNew.getTableName(),
});

/**
 * Process the APEX Refund database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexRefunds collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Refund document to be processed.
 * @returns A promise that resolves when the APEX Refund document has been processed.
 */
export async function processRawApexTransactionRefund(databaseOperation) {
	//

	//
	// Transform the APEX Refund document into a SimplifiedApexOnBoardRefund
	// and write it to the database, using a batch writer.

	try {
		let parseResult: null | SimplifiedApexOnBoardRefund = null;
		if (databaseOperation.fullDocument.version === 'refund-3.0') parseResult = parseRawApexTransactionRefundV30IntoSimplifiedApexOnBoardRefund(databaseOperation.fullDocument);
		if (!parseResult) return;
		await writer.write(parseResult);
	} catch (error) {
		Logger.error({ message: `Error transforming APEX Refund: ${databaseOperation.fullDocument.transaction.transactionId}: Reason: ${error.message}` });
	}

	//
};
