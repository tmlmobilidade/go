/* * */

import { setRidesAsWaiting } from '@tmlmobilidade/go-apex-pckg-callback';
import { parseRawApexTransactionBankingTapV40IntoSimplifiedApexBankingTap } from '@tmlmobilidade/go-apex-pckg-parsers';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RawApexTransaction, type SimplifiedApexBankingTap } from '@tmlmobilidade/go-types-apex';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { type ChangeStreamDocument } from 'mongodb';
import { ZodError } from 'zod';

/* * */

const writer = new BatchWriter<SimplifiedApexBankingTap>({
	batch_size: 10_000,
	batch_timeout: 30_000,
	insertFn: async (data) => {
		await labDb.simplifiedApex.bankingTaps.insert('JSONEachRow', data);
	},
	title: await labDb.simplifiedApex.bankingTaps.getTableName(),
});

/**
 * Process the APEX Banking Tap database operation by validating the operation type,
 * transforming the document, and writing it to the SimplifiedApexBankingTaps collection.
 * Additionally, publish heartbeats for each agency after processing the document.
 * @param databaseOperation The database operation containing the APEX Banking Tap document to be processed.
 * @returns A promise that resolves when the APEX Banking Tap document has been processed.
 */
export async function processRawApexTransactionBankingTap(databaseOperation: ChangeStreamDocument<RawApexTransaction>) {
	//

	//
	// Validate that the operation carries a full document.
	// Only insert operations are expected to occur in this collection.

	if (!('fullDocument' in databaseOperation) || !databaseOperation.fullDocument) return;

	//
	// Transform the APEX Banking Tap document into a SimplifiedApexBankingTap
	// and write it to the database, using a batch writer.

	try {
		let parseResult: null | SimplifiedApexBankingTap = null;
		if (databaseOperation.fullDocument.version === 'banking-tap-4.0') parseResult = parseRawApexTransactionBankingTapV40IntoSimplifiedApexBankingTap(databaseOperation.fullDocument);
		if (!parseResult) return;
		await writer.write(parseResult, { flushCallback: setRidesAsWaiting });
	} catch (error) {
		const errorMessage = error instanceof ZodError
			? error.issues.map(issue => `${issue.path.join('.')} ${issue.message}`).join('; ')
			: error instanceof Error ? error.message : String(error);
		Logger.error({ message: `Error transforming APEX Banking Tap: ${databaseOperation.fullDocument._id}: Reason: ${errorMessage}` });
	}

	//
};
