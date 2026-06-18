/* * */

import { simplifiedApexInspectionsNew } from '@tmlmobilidade/databases';
import { parseRawApexTransactionInspectionV20IntoSimplifiedApexInspection } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type SimplifiedApexInspection } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedApexInspection>({
	batch_size: 500,
	insertFn: async (data) => {
		await simplifiedApexInspectionsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexInspectionsNew.getTableName(),
});

/**
 * Process the APEX Inspection Decision database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexInspectionDecisions collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Inspection Decision document to be processed.
 * @returns A promise that resolves when the APEX Inspection Decision document has been processed.
 */
export async function processRawApexTransactionInspection(databaseOperation) {
	//

	//
	// Transform the APEX Inspection document into a SimplifiedApexInspection
	// and write it to the database, using a batch writer.

	try {
		let parseResult: null | SimplifiedApexInspection = null;
		if (databaseOperation.fullDocument.version === 'inspection-2.0') parseResult = parseRawApexTransactionInspectionV20IntoSimplifiedApexInspection(databaseOperation.fullDocument);
		if (!parseResult) return;
		await writer.write(parseResult);
	} catch (error) {
		Logger.error({ message: `Error transforming APEX Inspection: ${databaseOperation.fullDocument.transaction.transactionId}: Reason: ${error.message}` });
	}

	//
};
