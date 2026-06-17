/* * */

import { simplifiedApexBankingTapsNew } from '@tmlmobilidade/databases';
import { parseRawApexTransactionBankingTapV40 } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type SimplifiedApexBankingTap } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedApexBankingTap>({
	batch_size: 500,
	insertFn: async (data) => {
		await simplifiedApexBankingTapsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexBankingTapsNew.getTableName(),
});

/**
 * Process the APEX Banking Tap database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexBankingTaps collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Banking Tap document to be processed.
 * @returns A promise that resolves when the APEX Banking Tap document has been processed.
 */
export async function processRawApexTransactionBankingTap(databaseOperation) {
	//

	//
	// Transform the APEX Banking Tap document into a SimplifiedApexBankingTap
	// and write it to the database, using a batch writer.

	try {
		let parseResult: null | SimplifiedApexBankingTap = null;
		if (databaseOperation.fullDocument.version === 'banking-tap-4.0') parseResult = parseRawApexTransactionBankingTapV40(databaseOperation.fullDocument);
		if (!parseResult) return;
		await writer.write(parseResult);
	} catch (error) {
		Logger.error({ message: `Error transforming APEX Banking Tap: ${databaseOperation.fullDocument.transaction.transactionId}: Reason: ${error.message}` });
	}

	//
};
