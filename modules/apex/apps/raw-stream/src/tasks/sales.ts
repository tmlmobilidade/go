/* * */

import { simplifiedApexOnBoardSalesNew } from '@tmlmobilidade/databases';
import { parseRawApexTransactionSaleV30 } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedApexOnBoardSale>({
	batch_size: 500,
	insertFn: async (data) => {
		await simplifiedApexOnBoardSalesNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexOnBoardSalesNew.getTableName(),
});

/**
 * Process the APEX Sale database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexSales collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Sale document to be processed.
 * @returns A promise that resolves when the APEX Sale document has been processed.
 */
export async function processRawApexTransactionSale(databaseOperation) {
	//

	//
	// Transform the APEX Sale document into a SimplifiedApexOnBoardSale
	// and write it to the database, using a batch writer.

	try {
		let parseResult: null | SimplifiedApexOnBoardSale = null;
		if (databaseOperation.fullDocument.version === 'sale-3.0') parseResult = parseRawApexTransactionSaleV30(databaseOperation.fullDocument);
		if (!parseResult) return;
		await writer.write(parseResult);
	} catch (error) {
		Logger.error({ message: `Error transforming APEX Sale: ${databaseOperation.fullDocument.transaction.transactionId}: Reason: ${error.message}` });
	}

	//
};
