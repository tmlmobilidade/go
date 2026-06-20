/* * */

import { simplifiedApexInspectionDecisionsNew } from '@tmlmobilidade/databases';
import { parseRawApexTransactionInspectionDecisionV20IntoSimplifiedApexInspectionDecision } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type SimplifiedApexInspectionDecision } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedApexInspectionDecision>({
	batch_size: 500,
	insertFn: async (data) => {
		await simplifiedApexInspectionDecisionsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexInspectionDecisionsNew.getTableName(),
});

/**
 * Process the APEX Inspection Decision database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexInspectionDecisions collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Inspection Decision document to be processed.
 * @returns A promise that resolves when the APEX Inspection Decision document has been processed.
 */
export async function processRawApexTransactionInspectionDecision(databaseOperation) {
	//

	//
	// Transform the APEX Inspection Decision document into a SimplifiedApexInspectionDecision
	// and write it to the database, using a batch writer.

	try {
		let parseResult: null | SimplifiedApexInspectionDecision = null;
		if (databaseOperation.fullDocument.version === 'inspection-decision-2.0') parseResult = parseRawApexTransactionInspectionDecisionV20IntoSimplifiedApexInspectionDecision(databaseOperation.fullDocument);
		if (!parseResult) return;
		await writer.write(parseResult);
	} catch (error) {
		Logger.error({ message: `Error transforming APEX Inspection Decision: ${databaseOperation.fullDocument.transaction.transactionId}: Reason: ${error.message}` });
	}

	//
};
