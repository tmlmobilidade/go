/* * */

import { parseRawApexTransactionInspectionDecisionV20IntoSimplifiedApexInspectionDecision } from '@tmlmobilidade/go-apex-pckg-parsers';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type SimplifiedApexInspectionDecision } from '@tmlmobilidade/go-types-apex';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { ZodError } from 'zod';

/* * */

const writer = new BatchWriter<SimplifiedApexInspectionDecision>({
	batch_size: 10_000,
	batch_timeout: 30_000,
	insertFn: async (data) => {
		await labDb.simplifiedApex.inspectionDecisions.insert('JSONEachRow', data);
	},
	title: await labDb.simplifiedApex.inspectionDecisions.getTableName(),
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
		const errorMessage = error instanceof ZodError
			? error.issues.map(issue => `${issue.path.join('.')} ${issue.message}`).join('; ')
			: error instanceof Error ? error.message : String(error);
		Logger.error({ message: `Error transforming APEX Inspection Decision: ${databaseOperation.fullDocument.transaction.transactionId}: Reason: ${errorMessage}` });
	}

	//
};
