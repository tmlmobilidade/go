/* * */

import { rawApexTransactions, simplifiedApexInspectionDecisionsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { parseRawApexTransactionInspectionDecisionV20IntoSimplifiedApexInspectionDecision } from '@tmlmobilidade/go-apex-pckg-parsers';
import { type RawApexTransaction, type SimplifiedApexInspectionDecision } from '@tmlmobilidade/go-types-apex';
import { Logger } from '@tmlmobilidade/logger';
import { type PerformInTimeChunksItem, replicate } from '@tmlmobilidade/utils';
import { BatchWriter } from '@tmlmobilidade/utils';
import { type Filter } from 'mongodb';

/* * */

const writer = new BatchWriter<SimplifiedApexInspectionDecision>({
	batch_size: 10_000,
	insertFn: async (data) => {
		await simplifiedApexInspectionDecisionsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexInspectionDecisionsNew.getTableName(),
});

/**
 * Syncs APEX Inspection Decisions from the PCGI database
 * to the ClickHouse database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncApexInspectionDecisions(timeChunk: PerformInTimeChunksItem) {
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
		version: { $in: ['inspection-decision-2.0'] },
	};

	//
	// Implement the replication process using the generic replicate function from the utils package.
	// This function will handle the logic of counting, comparing, syncing and deleting documents
	// between the source and destination databases based on the provided functions.

	const rawApexTransactionsCollection = await rawApexTransactions.getCollection();

	await replicate<RawApexTransaction>({

		countDestinationDbFn: async () => {
			return await simplifiedApexInspectionDecisionsNew.count(
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
			await simplifiedApexInspectionDecisionsNew.delete(
				'_id IN $1',
				{ 1: ids },
			);
		},

		distinctDestinationDbFn: async () => {
			return await simplifiedApexInspectionDecisionsNew.distinct(
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
				let parseResult: null | SimplifiedApexInspectionDecision = null;
				if (sourceDbDocument.version === 'inspection-decision-2.0') parseResult = parseRawApexTransactionInspectionDecisionV20IntoSimplifiedApexInspectionDecision(sourceDbDocument);
				if (!parseResult) return;
				await writer.write(parseResult);
			} catch (error) {
				Logger.error({ message: `Error transforming APEX Inspection Decision: ${sourceDbDocument._id} Reason: ${error.message}` });
			}
		},

	});

	//
}
