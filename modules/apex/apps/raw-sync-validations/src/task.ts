/* * */

import { setRidesAsWaiting } from '@tmlmobilidade/go-apex-pckg-callback';
import { parseRawApexTransactionValidationV20IntoSimplifiedApexValidation, parseRawApexTransactionValidationV30IntoSimplifiedApexValidation, parseRawApexTransactionValidationV40IntoSimplifiedApexValidation, parseRawApexTransactionValidationV50IntoSimplifiedApexValidation } from '@tmlmobilidade/go-apex-pckg-parsers';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { type RawApexTransaction, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { BatchWriter, performInChunks, type PerformInTimeChunksItem, replicate } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';
import { type Filter } from 'mongodb';
import { ZodError } from 'zod';

/* * */

const writer = new BatchWriter<SimplifiedApexValidation>({
	batch_size: 10_000,
	insertFn: async (data) => {
		await labDb.simplifiedApex.validations.insert('JSONEachRow', data);
	},
	title: await labDb.simplifiedApex.validations.getTableName(),
});

/**
 * Syncs APEX Validations from the PCGI database
 * to the ClickHouse database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncApexValidations(timeChunk: PerformInTimeChunksItem) {
	//

	const chunkStartDate = Dates
		.fromUnixMilliseconds(timeChunk.start)
		.setZone('utc', 'offset_only');

	const chunkEndDate = Dates
		.fromUnixMilliseconds(timeChunk.end)
		.setZone('utc', 'offset_only');

	Logger.spacer(1);
	Logger.divider(`[${timeChunk.total - timeChunk.index}/${timeChunk.total}] - ${chunkEndDate.iso}[${timeChunk.end}] › ${chunkStartDate.iso}[${timeChunk.start}]`, 150);

	//
	// Prepare the PCGIDB query to retrieve documents
	// for the current timestamp chunk.

	const rawdbQuery: Filter<RawApexTransaction> = {
		created_at: {
			$gte: timeChunk.start,
			$lt: timeChunk.end,
		},
		version: { $in: ['validation-2.0', 'validation-3.0', 'validation-4.0', 'validation-5.0'] },
	};

	//
	// Implement the replication process using the generic replicate function from the utils package.
	// This function will handle the logic of counting, comparing, syncing and deleting documents
	// between the source and destination databases based on the provided functions.

	const rawApexTransactionsCollection = await rawDb.apex.transactions.getCollection();

	await replicate<RawApexTransaction>({

		countDestinationDbFn: async () => {
			return await labDb.simplifiedApex.validations.count(
				'*',
				'created_at >= $1 AND created_at < $2',
				{ 1: timeChunk.start, 2: timeChunk.end },
			);
		},

		countSourceDbFn: async () => {
			const result = await rawDb.apex.transactions.count(rawdbQuery);
			return result;
		},

		deleteDestinationDbFn: async (ids: string[]) => {
			await performInChunks(ids, async (chunk) => {
				await labDb.simplifiedApex.validations.delete(
					'_id IN $1',
					{ 1: chunk },
				);
			}, 1_000);
		},

		distinctDestinationDbFn: async () => {
			const result = await labDb.simplifiedApex.validations.distinct(
				'_id',
				'created_at >= $1 AND created_at < $2',
				{ 1: timeChunk.start, 2: timeChunk.end },
			);
			return result.map(id => String(id).toUpperCase());
		},

		distinctSourceDbFn: async () => {
			return await rawDb.apex.transactions.distinct('_id', rawdbQuery);
		},

		missingDocumentsSourceDbAsyncIterator: (missingDocumentIds) => {
			return rawApexTransactionsCollection
				.find({ _id: { $in: missingDocumentIds } })
				.stream();
		},

		onCompleteCallbackFn: async () => {
			await writer.flush(setRidesAsWaiting);
		},

		writeSourceDocumentToDestinationDbFn: async (sourceDbDocument) => {
			try {
				let parseResult: null | SimplifiedApexValidation = null;
				if (sourceDbDocument.version === 'validation-2.0') parseResult = parseRawApexTransactionValidationV20IntoSimplifiedApexValidation(sourceDbDocument);
				if (sourceDbDocument.version === 'validation-3.0') parseResult = parseRawApexTransactionValidationV30IntoSimplifiedApexValidation(sourceDbDocument);
				if (sourceDbDocument.version === 'validation-4.0') parseResult = parseRawApexTransactionValidationV40IntoSimplifiedApexValidation(sourceDbDocument);
				if (sourceDbDocument.version === 'validation-5.0') parseResult = parseRawApexTransactionValidationV50IntoSimplifiedApexValidation(sourceDbDocument);
				if (!parseResult) return;
				await writer.write(parseResult, { flushCallback: setRidesAsWaiting });
			} catch (error) {
				const errorMessage = error instanceof ZodError
					? error.issues.map(issue => `${issue.path.join('.')} ${issue.message}`).join('; ')
					: error instanceof Error ? error.message : String(error);
				Logger.error({ message: `Error transforming APEX Validation: ${sourceDbDocument._id} Reason: ${errorMessage}` });
			}
		},

	});

	//
}
