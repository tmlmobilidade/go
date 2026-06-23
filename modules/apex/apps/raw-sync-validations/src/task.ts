/* * */

import { rawApexTransactions, simplifiedApexValidationsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { parseRawApexTransactionValidationV20IntoSimplifiedApexValidation, parseRawApexTransactionValidationV30IntoSimplifiedApexValidation, parseRawApexTransactionValidationV40IntoSimplifiedApexValidation, parseRawApexTransactionValidationV50IntoSimplifiedApexValidation } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type RawApexTransaction, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { performInChunks, type PerformInTimeChunksItem, replicate } from '@tmlmobilidade/utils';
import { BatchWriter } from '@tmlmobilidade/utils';
import { type Filter } from 'mongodb';

/* * */

const writer = new BatchWriter<SimplifiedApexValidation>({
	batch_size: 10_000,
	insertFn: async (data) => {
		await simplifiedApexValidationsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexValidationsNew.getTableName(),
});

/**
 * Syncs APEX Validations from the PCGI database
 * to the ClickHouse database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncApexValidations(timeChunk: PerformInTimeChunksItem) {
	//

	const chunkStartDate = Dates
		.fromUnixTimestamp(timeChunk.start)
		.setZone('utc', 'offset_only');

	const chunkEndDate = Dates
		.fromUnixTimestamp(timeChunk.end)
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

	const rawApexTransactionsCollection = await rawApexTransactions.getCollection();

	await replicate<RawApexTransaction>({

		countDestinationDbFn: async () => {
			return await simplifiedApexValidationsNew.count(
				'*',
				'created_at >= $1 AND created_at < $2',
				{ 1: timeChunk.start, 2: timeChunk.end },
			);
		},

		countSourceDbFn: async () => {
			const result = await rawApexTransactions.count(rawdbQuery);
			return result;
		},

		deleteDestinationDbFn: async (ids: string[]) => {
			await performInChunks(ids, async (chunk) => {
				await simplifiedApexValidationsNew.delete(
					'_id IN $1',
					{ 1: chunk },
				);
			}, 1_000);
		},

		distinctDestinationDbFn: async () => {
			return await simplifiedApexValidationsNew.distinct(
				'upper(toString(_id))',
				'created_at >= $1 AND created_at < $2',
				{ 1: timeChunk.start, 2: timeChunk.end },
			);
		},

		distinctSourceDbFn: async () => {
			return await rawApexTransactions.distinct('_id', rawdbQuery);
		},

		missingDocumentsSourceDbAsyncIterator: (missingDocumentIds) => {
			return rawApexTransactionsCollection
				.find({ _id: { $in: missingDocumentIds } })
				.stream();
		},

		onCompleteCallbackFn: async () => {
			await writer.flush();
		},

		writeSourceDocumentToDestinationDbFn: async (sourceDbDocument) => {
			try {
				let parseResult: null | SimplifiedApexValidation = null;
				if (sourceDbDocument.version === 'validation-2.0') parseResult = parseRawApexTransactionValidationV20IntoSimplifiedApexValidation(sourceDbDocument);
				if (sourceDbDocument.version === 'validation-3.0') parseResult = parseRawApexTransactionValidationV30IntoSimplifiedApexValidation(sourceDbDocument);
				if (sourceDbDocument.version === 'validation-4.0') parseResult = parseRawApexTransactionValidationV40IntoSimplifiedApexValidation(sourceDbDocument);
				if (sourceDbDocument.version === 'validation-5.0') parseResult = parseRawApexTransactionValidationV50IntoSimplifiedApexValidation(sourceDbDocument);
				if (!parseResult) return;
				await writer.write(parseResult);
			} catch (error) {
				Logger.error({ message: `Error transforming APEX Validation: ${sourceDbDocument._id} Reason: ${error.message}` });
			}
		},

	});

	//
}
