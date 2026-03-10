/* * */

import { clickhouseService } from '@tmlmobilidade/clickhouse';
import { getEarliestDate } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { invalidateRides, parseSimplifiedApexValidation, simplifiedApexValidationsSchema } from '@tmlmobilidade/go-apex-pckg-common';
import { pcgidbValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { performInTimeChunks, PerformInTimeChunksItem, runOnInterval } from '@tmlmobilidade/utils';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

async function syncApexValidationsChunk({ chunk, writer }: { chunk: PerformInTimeChunksItem, writer: ClickHouseWriter<SimplifiedApexValidation> }) {
	//

	const chunkTimer = new Timer();

	const chunkStartDate = Dates
		.fromUnixTimestamp(chunk.start)
		.setZone('Europe/Lisbon', 'offset_only');

	const chunkEndDate = Dates
		.fromUnixTimestamp(chunk.end)
		.setZone('Europe/Lisbon', 'offset_only');

	Logger.spacer(1);
	Logger.divider(`[${chunk.total - chunk.index}/${chunk.total}] - ${chunkEndDate.iso}[${chunkEndDate.unix_timestamp}] › ${chunkStartDate.iso}[${chunkStartDate.unix_timestamp}]`, 150);

	//
	// Prepare the queries to compare documents from each database
	// in the current timestamp chunk.

	const pcgiCollection = pcgidbValidations.ValidationEntity;

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

	await pcgidbValidations.connect();
	const pcgidbCollection = pcgidbValidations.ValidationEntity;

	const pcgiDocCount = await pcgidbCollection.countDocuments(pcgiQuery);
	const clickhouseDocCount = await clickhouseService.queryFromString<{ count: number }>('SELECT COUNT(*) as count FROM simplified_apex_validations WHERE created_at >= $1 AND created_at <= $2', { 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp });

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

	const pcgiDocIds = await pcgidbCollection.distinct('transaction.transactionId', pcgiQuery);
	const pcgiDocIdsUnique = new Set(pcgiDocIds.map(String));

	const clickhouseDocIds = await clickhouseService.queryFromString<{ _id: string }>('SELECT _id FROM simplified_apex_validations WHERE created_at >= $1 AND created_at <= $2', { 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp });
	const clickhouseDocIdsUnique = new Set(clickhouseDocIds.map(doc => doc._id));

	const missingDocuments = pcgiDocIds.filter((documentId: string) => !clickhouseDocIdsUnique.has(String(documentId)));
	const extraDocuments = clickhouseDocIds.filter(doc => !pcgiDocIdsUnique.has(String(doc._id)));

	Logger.info(`PCGI Total: ${pcgiDocCount} | PCGI Unique: ${pcgiDocIdsUnique.size} | PCGI ▲: ${pcgiDocCount - pcgiDocIdsUnique.size} | ClickHouse Total: ${clickhouseDocCount[0].count} | ClickHouse Unique: ${clickhouseDocIdsUnique.size} | ClickHouse ▲: ${clickhouseDocCount[0].count - clickhouseDocIdsUnique.size} | ClickHouse Missing: ${missingDocuments.length} | ClickHouse Extra: ${extraDocuments.length} (${distinctQueryTimer.get()})`);

	//
	// If all documents are already synced, then we can skip the rest of the process.

	if (missingDocuments.length === 0) {
		Logger.success(`Chunk complete. All document IDs matched. (${distinctQueryTimer.get()})`);
	}

	//
	// If there are extra documents in the GO database, then we remove them.

	if (extraDocuments.length > 0) {
		await clickhouseService.queryFromString('DELETE FROM simplified_apex_validations WHERE _id IN ($1)', { 1: extraDocuments.map(doc => `'${doc._id}'`).join(', ') });
		Logger.info(`Removed ${extraDocuments.length} extra documents in ClickHouse. (${distinctQueryTimer.get()})`);
	}

	//
	// If there are missing documents, then we sync them.
	// We query the PCGIDB for the missing documents and write them to the GO database.

	Logger.info(`Found ${missingDocuments.length} missing documents in GO. (${distinctQueryTimer.get()})`);

	const missingDocumentsStream = pcgiCollection
		.find({ 'transaction.transactionId': { $in: missingDocuments } })
		.stream();

	for await (const pcgiDocument of missingDocumentsStream) {
		const parsedSlaDoc = parseSimplifiedApexValidation(pcgiDocument);
		if (!parsedSlaDoc) continue; // Skip if parsing failed
		await writer.write(parsedSlaDoc, { flushCallback: invalidateRides });
	}

	await writer.flush(invalidateRides);

	//

	Logger.success(`Chunk sync complete (${chunkTimer.get()})`);

	//
}

const client = await clickhouseService.getClient();
const writer = new ClickHouseWriter<SimplifiedApexValidation>({
	client,
	table: 'simplified_apex_validations',
	tableSchema: simplifiedApexValidationsSchema,
});

async function syncApexValidations() {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		//

		const earliestDate = getEarliestDate();

		await performInTimeChunks({
			onChunk: async chunk => syncApexValidationsChunk({ chunk, writer }),
			splitBy: { hours: 4 },
			startDate: earliestDate.unix_timestamp,
		});

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		console.log('An error occurred. Halting execution.', err);
	}
}

/* * */
await runOnInterval(syncApexValidations, 1_800_000); // 30 minutes
