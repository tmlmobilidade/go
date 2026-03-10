/* * */

import { clickhouseService } from '@tmlmobilidade/clickhouse';
import { Dates } from '@tmlmobilidade/dates';
import { invalidateRides, PARSER_MAP } from '@tmlmobilidade/go-tracker-pckg-common';
import { simplifiedVehicleEventsSchema } from '@tmlmobilidade/go-tracker-pckg-common';
import { rawVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { PerformInTimeChunksItem } from '@tmlmobilidade/utils';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

const writer = new ClickHouseWriter<SimplifiedVehicleEvent>({
	client: await clickhouseService.getClient(),
	table: 'simplified_vehicle_events',
	tableSchema: simplifiedVehicleEventsSchema,
});

export async function syncVehicleEvents(timeChunk: PerformInTimeChunksItem) {
	//

	await writer.ensureTable();

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

	const originDbQuery = {
		created_at: {
			$gte: chunkStartDate.unix_timestamp,
			$lte: chunkEndDate.unix_timestamp,
		},
	};

	//
	// Count how many documents are matched in each database
	// for the given queries. If the document count is the same for both databases,
	// then we assume all documents are synced, and we can skip the rest of the process.

	const countQueryTimer = new Timer();

	const originDbCollection = await rawVehicleEvents.getCollection();

	const originDbDocCount = await originDbCollection.countDocuments(originDbQuery);
	const clickhouseDocCount = await clickhouseService.queryFromString<{ count: number }>('SELECT COUNT(*) as count FROM simplified_vehicle_events WHERE created_at >= $1 AND created_at <= $2', { 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp });

	if (originDbDocCount === clickhouseDocCount[0].count) {
		Logger.success(`MATCH: Found the same number of documents in both databases: ${originDbDocCount} originDbDB = ${clickhouseDocCount} ClickHouse (${countQueryTimer.get()})`);
		return;
	}

	Logger.info(`MISMATCH: Document count was different for both databases: ${originDbDocCount} originDbDB != ${clickhouseDocCount[0].count} ClickHouse (${countQueryTimer.get()})`);

	//
	// If the document count was different, then we check which documents are missing.
	// Instead of syncing all documents again, we check only the missing IDs. This is done
	// by getting the distinct IDs from each database and comparing them to find the missing ones.

	const distinctQueryTimer = new Timer();

	const originDbDocIds = await originDbCollection.distinct('_id', originDbQuery);
	const originDbDocIdsUnique = new Set(originDbDocIds.map(String));

	const clickhouseDocIds = await clickhouseService.queryFromString<{ _id: string }>('SELECT _id FROM simplified_vehicle_events WHERE created_at >= $1 AND created_at <= $2', { 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp });
	const clickhouseDocIdsUnique = new Set(clickhouseDocIds.map(doc => doc._id));

	const missingDocuments = originDbDocIds.filter((documentId: string) => !clickhouseDocIdsUnique.has(String(documentId)));
	const extraDocuments = clickhouseDocIds.filter(doc => !originDbDocIdsUnique.has(String(doc._id)));

	Logger.info(`originDb Total: ${originDbDocCount} | originDb Unique: ${originDbDocIdsUnique.size} | originDb ▲: ${originDbDocCount - originDbDocIdsUnique.size} | ClickHouse Total: ${clickhouseDocCount[0].count} | ClickHouse Unique: ${clickhouseDocIdsUnique.size} | ClickHouse ▲: ${clickhouseDocCount[0].count - clickhouseDocIdsUnique.size} | ClickHouse Missing: ${missingDocuments.length} | ClickHouse Extra: ${extraDocuments.length} (${distinctQueryTimer.get()})`);

	//
	// Skip if all documents are already synced.

	if (missingDocuments.length === 0) {
		Logger.success(`Chunk complete. All document IDs matched. (${distinctQueryTimer.get()})`);
	}

	//
	// Extra documents in the destination database should be removed,
	// as they are not present in the source database.

	if (extraDocuments.length > 0) {
		await clickhouseService.queryFromString('DELETE FROM simplified_vehicle_events WHERE _id IN ($1)', { 1: extraDocuments.map(doc => `'${doc._id}'`).join(', ') });
		Logger.info(`Removed ${extraDocuments.length} extra documents in ClickHouse. (${distinctQueryTimer.get()})`);
	}

	//
	// If there are missing documents, then we sync them.
	// We query the originDbDB for the missing documents and write them to the GO database.

	Logger.info(`Found ${missingDocuments.length} missing documents in GO. (${distinctQueryTimer.get()})`);

	const missingDocumentsStream = originDbCollection
		.find({ _id: { $in: missingDocuments } })
		.stream();

	for await (const originDbDocument of missingDocumentsStream) {
		const parser = PARSER_MAP[originDbDocument.version];
		const parsedSlaDoc = parser(originDbDocument);
		if (!parsedSlaDoc) continue; // Skip if parsing failed
		await writer.write(parsedSlaDoc, { flushCallback: invalidateRides });
	}

	await writer.flush(invalidateRides);

	Logger.success(`Chunk sync complete (${chunkTimer.get()})`);

	//
}
