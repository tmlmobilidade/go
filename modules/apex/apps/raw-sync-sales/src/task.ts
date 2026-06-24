/* * */

import { rawApexTransactions, simplifiedApexOnBoardSalesNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { setRidesAsWaiting } from '@tmlmobilidade/go-apex-pckg-callback';
import { parseRawApexTransactionSaleV30IntoSimplifiedApexOnBoardSale } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type RawApexTransaction, type SimplifiedApexOnBoardSale } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { performInChunks, type PerformInTimeChunksItem, replicate } from '@tmlmobilidade/utils';
import { BatchWriter } from '@tmlmobilidade/utils';
import { type Filter } from 'mongodb';

/* * */

const writer = new BatchWriter<SimplifiedApexOnBoardSale>({
	batch_size: 10_000,
	insertFn: async (data) => {
		await simplifiedApexOnBoardSalesNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexOnBoardSalesNew.getTableName(),
});

/**
 * Syncs APEX Sales from the PCGI database
 * to the ClickHouse database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncApexSales(timeChunk: PerformInTimeChunksItem) {
	//

	const chunkStartDate = Dates
		.fromUnixTimestamp(timeChunk.start)
		.setZone('Europe/Lisbon', 'offset_only');

	const chunkEndDate = Dates
		.fromUnixTimestamp(timeChunk.end)
		.setZone('Europe/Lisbon', 'offset_only');

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
		version: { $in: ['sale-3.0'] },
	};

	//
	// Implement the replication process using the generic replicate function from the utils package.
	// This function will handle the logic of counting, comparing, syncing and deleting documents
	// between the source and destination databases based on the provided functions.

	const rawApexTransactionsCollection = await rawApexTransactions.getCollection();

	await replicate<RawApexTransaction>({

		countDestinationDbFn: async () => {
			return await simplifiedApexOnBoardSalesNew.count(
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
				await simplifiedApexOnBoardSalesNew.delete(
					'_id IN $1',
					{ 1: chunk },
				);
			}, 1_000);
		},

		distinctDestinationDbFn: async () => {
			return await simplifiedApexOnBoardSalesNew.distinct(
				'upper(toString(_id))',
				'created_at >= $1 AND created_at < $2',
				{ 1: timeChunk.start, 2: timeChunk.end },
			);
		},

		distinctSourceDbFn: async () => {
			const result = await rawApexTransactions.distinct('_id', rawdbQuery);
			return result.map(String);
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
				let parseResult: null | SimplifiedApexOnBoardSale = null;
				if (sourceDbDocument.version === 'sale-3.0') parseResult = parseRawApexTransactionSaleV30IntoSimplifiedApexOnBoardSale(sourceDbDocument);
				if (!parseResult) return;
				await writer.write(parseResult, { flushCallback: setRidesAsWaiting });
			} catch (error) {
				Logger.error({ message: `Error transforming APEX Sale: ${sourceDbDocument._id} Reason: ${error.message}` });
			}
		},

	});

	//
}
