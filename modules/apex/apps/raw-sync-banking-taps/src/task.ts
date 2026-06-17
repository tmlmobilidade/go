/* * */

import { rawApexTransactions, simplifiedApexBankingTapsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { parseRawApexTransactionBankingTapV40IntoSimplifiedApexBankingTap } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type RawApexTransaction, SimplifiedApexBankingTap } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { type PerformInTimeChunksItem, replicate } from '@tmlmobilidade/utils';
import { BatchWriter } from '@tmlmobilidade/utils';
import { type Filter } from 'mongodb';

/* * */

const writer = new BatchWriter<SimplifiedApexBankingTap>({
	batch_size: 50_000,
	insertFn: async (data) => {
		await simplifiedApexBankingTapsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexBankingTapsNew.getTableName(),
});

/**
 * Syncs APEX Banking Taps from the PCGI database
 * to the ClickHouse database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncApexBankingTaps(timeChunk: PerformInTimeChunksItem) {
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
		version: { $in: ['banking-tap-4.0'] },
	};

	//
	// Implement the replication process using the generic replicate function from the utils package.
	// This function will handle the logic of counting, comparing, syncing and deleting documents
	// between the source and destination databases based on the provided functions.

	const rawApexTransactionsCollection = await rawApexTransactions.getCollection();

	await replicate<RawApexTransaction>({

		countDestinationDbFn: async () => {
			return await simplifiedApexBankingTapsNew.count(
				'*',
				'created_at >= fromUnixTimestamp64Milli($1) AND created_at < fromUnixTimestamp64Milli($2)',
				{ 1: timeChunk.start, 2: timeChunk.end },
			);
		},

		countSourceDbFn: async () => {
			const result = await rawApexTransactions.count(rawdbQuery);
			return result;
		},

		deleteDestinationDbFn: async (ids: string[]) => {
			await simplifiedApexBankingTapsNew.delete(
				'_id IN $1',
				{ 1: ids },
			);
		},

		distinctDestinationDbFn: async () => {
			return await simplifiedApexBankingTapsNew.distinct(
				'_id',
				'created_at >= fromUnixTimestamp64Milli($1) AND created_at < fromUnixTimestamp64Milli($2)',
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
				let parseResult: null | SimplifiedApexBankingTap = null;
				if (sourceDbDocument.version === 'banking-tap-4.0') parseResult = parseRawApexTransactionBankingTapV40IntoSimplifiedApexBankingTap(sourceDbDocument);
				if (!parseResult) return;
				await writer.write(parseResult);
			} catch (error) {
				Logger.error(`Error transforming APEX Banking Tap: ${sourceDbDocument._id} Reason: ${error.message}`);
			}
		},

	});

	//
}
