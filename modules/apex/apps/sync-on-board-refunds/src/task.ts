/* * */

import { clickhouseService } from '@tmlmobilidade/clickhouse';
import { Dates } from '@tmlmobilidade/dates';
import { APEX_ON_BOARD_REFUNDS_SETTINGS, invalidateRides, parseSimplifiedApexOnBoardRefund, simplifiedApexOnBoardRefundsSchema } from '@tmlmobilidade/go-apex-pckg-common';
import { pcgidbTicketing } from '@tmlmobilidade/go-apex-pckg-databases';
import { Logger } from '@tmlmobilidade/logger';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/types';
import { type PerformInTimeChunksItem, replicate } from '@tmlmobilidade/utils';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

const writer = new ClickHouseWriter<SimplifiedApexOnBoardRefund>({
	client: await clickhouseService.getClient(),
	table: 'simplified_apex_on_board_refunds',
	tableSchema: simplifiedApexOnBoardRefundsSchema,
});

/**
 * Syncs APEX OnBoardRefunds from the PCGI database
 * to the ClickHouse database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncApexOnBoardRefunds(timeChunk: PerformInTimeChunksItem) {
	//

	await writer.init();

	const chunkStartDate = Dates
		.fromUnixTimestamp(timeChunk.start)
		.setZone('Europe/Lisbon', 'offset_only');

	const chunkEndDate = Dates
		.fromUnixTimestamp(timeChunk.end)
		.setZone('Europe/Lisbon', 'offset_only');

	Logger.spacer(1);
	Logger.divider(`[${timeChunk.total - timeChunk.index}/${timeChunk.total}] - ${chunkEndDate.iso}[${chunkEndDate.unix_timestamp}] › ${chunkStartDate.iso}[${chunkStartDate.unix_timestamp}]`, 150);

	//
	// Prepare the PCGIDB query to retrieve documents
	// for the current timestamp chunk.

	const pcgidbQuery = {
		'transaction.apexTransactionType': APEX_ON_BOARD_REFUNDS_SETTINGS.allowed_apex_transaction_type,
		'transaction.apexTransactionVersion': { $in: APEX_ON_BOARD_REFUNDS_SETTINGS.allowed_apex_transaction_versions },
		'transaction.cardPhysicalType': APEX_ON_BOARD_REFUNDS_SETTINGS.allowed_card_physical_type,
		'transaction.operatorLongID': { $in: APEX_ON_BOARD_REFUNDS_SETTINGS.allowed_operator_long_ids },
		'transaction.transactionDate': {
			$gte: chunkStartDate.toFormat('yyyy-LL-dd\'T\'HH\':\'mm\':\'ss'),
			$lte: chunkEndDate.toFormat('yyyy-LL-dd\'T\'HH\':\'mm\':\'ss'),
		},
	};

	//
	// Implement the replication process using the generic replicate function from the utils package.
	// This function will handle the logic of counting, comparing, syncing and deleting documents
	// between the source and destination databases based on the provided functions.

	await replicate<unknown>({

		countDestinationDbFn: async () => {
			const result = await clickhouseService.queryFromString<{ count: number }>(
				'SELECT COUNT(*) as count FROM simplified_apex_on_board_refunds WHERE created_at >= $1 AND created_at <= $2',
				{ 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp },
			);
			return result[0].count;
		},

		countSourceDbFn: async () => {
			const result = await pcgidbTicketing.SalesEntity.countDocuments(pcgidbQuery);
			return result;
		},

		deleteDestinationDbFn: async (ids: string[]) => {
			await clickhouseService.queryFromString(
				'DELETE FROM simplified_apex_on_board_refunds WHERE _id IN ($1)',
				{ 1: ids.map(id => `'${id}'`).join(', ') },
			);
		},

		distinctDestinationDbFn: async () => {
			const result = await clickhouseService.queryFromString<{ _id: string }>(
				'SELECT _id FROM simplified_apex_on_board_refunds WHERE created_at >= $1 AND created_at <= $2',
				{ 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp },
			);
			return result.map(doc => doc._id);
		},

		distinctSourceDbFn: async () => {
			const result = await pcgidbTicketing.SalesEntity.distinct('transaction.transactionId', pcgidbQuery);
			return result.map(String);
		},

		missingDocumentsSourceDbAsyncIterator: (missingDocumentIds) => {
			return pcgidbTicketing.SalesEntity
				.find({ 'transaction.transactionId': { $in: missingDocumentIds } })
				.stream();
		},

		onCompleteCallbackFn: async () => {
			await writer.flush(invalidateRides);
		},

		writeSourceDocumentToDestinationDbFn: async (sourceDbDocument) => {
			const parseResult = parseSimplifiedApexOnBoardRefund(sourceDbDocument);
			if (!parseResult) return; // Skip if parsing failed
			await writer.write(parseResult, { flushCallback: invalidateRides });
		},

	});

	//
}
