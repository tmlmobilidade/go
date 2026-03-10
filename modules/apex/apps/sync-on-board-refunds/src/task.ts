/* * */

import { clickhouseService } from '@tmlmobilidade/clickhouse';
import { Dates } from '@tmlmobilidade/dates';
import { invalidateRides, parseSimplifiedApexOnBoardRefund, simplifiedApexOnBoardRefundsSchema } from '@tmlmobilidade/go-apex-pckg-common';
import { pcgidbTicketing } from '@tmlmobilidade/go-apex-pckg-databases';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/types';
import { type PerformInTimeChunksItem } from '@tmlmobilidade/utils';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

const client = await clickhouseService.getClient();

const writer = new ClickHouseWriter<SimplifiedApexOnBoardRefund>({
	client,
	table: 'simplified_apex_on_board_refunds',
	tableSchema: simplifiedApexOnBoardRefundsSchema,
});

/**
 * Syncs the Apex OnBoardRefunds from the PCGI database
 * to the ClickHouse database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncApexOnBoardRefunds(timeChunk: PerformInTimeChunksItem) {
	//

	const chunkTimer = new Timer();

	const chunkStartDate = Dates
		.fromUnixTimestamp(timeChunk.start)
		.setZone('Europe/Lisbon', 'offset_only');

	const chunkEndDate = Dates
		.fromUnixTimestamp(timeChunk.end)
		.setZone('Europe/Lisbon', 'offset_only');

	Logger.spacer(1);
	Logger.divider(`[${timeChunk.total - timeChunk.index}/${timeChunk.total}] - ${chunkEndDate.iso}[${chunkEndDate.unix_timestamp}] › ${chunkStartDate.iso}[${chunkStartDate.unix_timestamp}]`, 150);

	//
	// Prepare the queries to compare documents from each database
	// in the current timestamp chunk.

	const pcgiQuery = {
		'transaction.apexTransactionType': 11,
		'transaction.operatorLongID': { $in: ['41', '42', '43', '44'] },
		'transaction.transactionDate': {
			$gte: chunkStartDate.toFormat('yyyy-LL-dd\'T\'HH\':\'mm\':\'ss'),
			$lte: chunkEndDate.toFormat('yyyy-LL-dd\'T\'HH\':\'mm\':\'ss'),
		},
	};

	//
	// Count how many documents are matched in each database
	// for the given queries. If the document count is the same for both databases,
	// then we assume all documents are synced, and we can skip the rest of the process.

	const countQueryTimer = new Timer();

	await pcgidbTicketing.connect();
	const pcgiDocCount = await pcgidbTicketing.SalesEntity.countDocuments(pcgiQuery);
	const clickhouseDocCount = await clickhouseService.queryFromString<{ count: number }>('SELECT COUNT(*) as count FROM simplified_apex_on_board_refunds WHERE created_at >= $1 AND created_at <= $2', { 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp });

	if (pcgiDocCount === clickhouseDocCount[0].count) {
		Logger.success(`MATCH: Found the same number of documents in both databases: ${pcgiDocCount} PCGIDB = ${clickhouseDocCount} ClickHouse (${countQueryTimer.get()})`);
		return;
	}

	Logger.info(`MISMATCH: Document count was different for both databases: ${pcgiDocCount} PCGIDB != ${clickhouseDocCount[0].count} ClickHouse (${countQueryTimer.get()})`);

	//
	// If the document count was different, then we check which documents are missing.
	// Instead of syncing all documents again, we check only the missing IDs. This is done
	// by getting the distinct IDs from each database and comparing them to find the missing ones.

	const distinctQueryTimer = new Timer();

	const pcgiDocIds = await pcgidbTicketing.SalesEntity.distinct('transaction.transactionId', pcgiQuery);
	const pcgiDocIdsUnique = new Set(pcgiDocIds.map(String));

	const clickhouseDocIds = await clickhouseService.queryFromString<{ _id: string }>('SELECT _id FROM simplified_apex_on_board_sales WHERE created_at >= $1 AND created_at <= $2', { 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp });
	const clickhouseDocIdsUnique = new Set(clickhouseDocIds.map(doc => doc._id));

	const missingDocuments = pcgiDocIds.filter((documentId: string) => !clickhouseDocIdsUnique.has(String(documentId)));
	const extraDocuments = clickhouseDocIds.filter(doc => !pcgiDocIdsUnique.has(String(doc._id)));

	Logger.info(`PCGI Total: ${pcgiDocCount} | PCGI Unique: ${pcgiDocIdsUnique.size} | PCGI ▲: ${pcgiDocCount - pcgiDocIdsUnique.size} | ClickHouse Total: ${clickhouseDocCount[0].count} | ClickHouse Unique: ${clickhouseDocIdsUnique.size} | ClickHouse ▲: ${clickhouseDocCount[0].count - clickhouseDocIdsUnique.size} | ClickHouse Missing: ${missingDocuments.length} | ClickHouse Extra: ${extraDocuments.length} (${distinctQueryTimer.get()})`);

	//
	// Skip if all documents are already synced.

	if (missingDocuments.length === 0) {
		Logger.success(`Chunk complete. All document IDs matched. (${distinctQueryTimer.get()})`);
	}

	//
	// Extra documents in the destination database should be removed,
	// as they are not present in the source database.

	if (extraDocuments.length > 0) {
		await clickhouseService.queryFromString('DELETE FROM simplified_apex_on_board_sales WHERE _id IN ($1)', { 1: extraDocuments.map(doc => `'${doc._id}'`).join(', ') });
		Logger.info(`Removed ${extraDocuments.length} extra documents in ClickHouse. (${distinctQueryTimer.get()})`);
	}

	//
	// If there are missing documents, then we sync them.
	// We query the PCGIDB for the missing documents and write them to the GO database.

	Logger.info(`Found ${missingDocuments.length} missing documents in GO. (${distinctQueryTimer.get()})`);

	const missingDocumentsStream = pcgidbTicketing.SalesEntity
		.find({ 'transaction.transactionId': { $in: missingDocuments } })
		.stream();

	for await (const pcgiDocument of missingDocumentsStream) {
		const parsedSlaDoc = parseSimplifiedApexOnBoardRefund(pcgiDocument);
		if (!parsedSlaDoc) continue; // Skip if parsing failed
		await writer.write(parsedSlaDoc, { flushCallback: invalidateRides });
	}

	await writer.flush(invalidateRides);

	Logger.success(`Chunk sync complete (${chunkTimer.get()})`);

	//
}
