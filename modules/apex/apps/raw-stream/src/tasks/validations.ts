/* * */

import { simplifiedApexValidationsNew } from '@tmlmobilidade/databases';
import { parseRawApexTransactionValidationV20, parseRawApexTransactionValidationV30, parseRawApexTransactionValidationV40, parseRawApexTransactionValidationV50 } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedApexValidation>({
	batch_size: 500,
	insertFn: async (data) => {
		await simplifiedApexValidationsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexValidationsNew.getTableName(),
});

/**
 * Process the APEX Validation database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexValidations collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Validation document to be processed.
 * @returns A promise that resolves when the APEX Validation document has been processed.
 */
export async function processRawApexTransactionValidation(databaseOperation) {
	//

	//
	// Transform the APEX Validation document into a SimplifiedApexValidation
	// and write it to the database, using a batch writer.

	try {
		let parseResult: null | SimplifiedApexValidation = null;
		if (databaseOperation.fullDocument.version === 'validation-2.0') parseResult = parseRawApexTransactionValidationV20(databaseOperation.fullDocument);
		if (databaseOperation.fullDocument.version === 'validation-3.0') parseResult = parseRawApexTransactionValidationV30(databaseOperation.fullDocument);
		if (databaseOperation.fullDocument.version === 'validation-4.0') parseResult = parseRawApexTransactionValidationV40(databaseOperation.fullDocument);
		if (databaseOperation.fullDocument.version === 'validation-5.0') parseResult = parseRawApexTransactionValidationV50(databaseOperation.fullDocument);
		if (!parseResult) return;
		await writer.write(parseResult);
	} catch (error) {
		Logger.error({ message: `Error transforming APEX Validation: ${databaseOperation.fullDocument.transaction.transactionId}: Reason: ${error.message}` });
	}

	//
};
