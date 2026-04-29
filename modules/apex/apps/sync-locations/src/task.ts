/* * */

import { pcgiValidations, simplifiedApexLocationsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { APEX_LOCATIONS_SETTINGS, invalidateRides, parseSimplifiedApexLocation } from '@tmlmobilidade/go-apex-pckg-shared';
import { Logger } from '@tmlmobilidade/logger';
import { type SimplifiedApexLocation } from '@tmlmobilidade/types';
import { type PerformInTimeChunksItem, replicate } from '@tmlmobilidade/utils';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

const writer = new BatchWriter<SimplifiedApexLocation>({
	batch_size: 50_000,
	insertFn: async (data) => {
		await simplifiedApexLocationsNew.insert('JSONEachRow', data);
	},
	title: await simplifiedApexLocationsNew.getTableName(),
});

/**
 * Syncs APEX Locations from the PCGI database
 * to the ClickHouse database for a given time chunk.
 * @param timeChunk The time chunk to sync the data for.
 */
export async function syncApexLocations(timeChunk: PerformInTimeChunksItem) {
	//

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
		'transaction.apexTransactionType': APEX_LOCATIONS_SETTINGS.allowed_apex_transaction_type,
		'transaction.apexTransactionVersion': { $in: APEX_LOCATIONS_SETTINGS.allowed_apex_transaction_versions },
		'transaction.operatorLongID': { $in: APEX_LOCATIONS_SETTINGS.allowed_operator_long_ids },
		'transaction.transactionDate': {
			$gte: chunkStartDate.toFormat('yyyy-LL-dd\'T\'HH\':\'mm\':\'ss'),
			$lte: chunkEndDate.toFormat('yyyy-LL-dd\'T\'HH\':\'mm\':\'ss'),
		},
	};

	//
	// Implement the replication process using the generic replicate function from the utils package.
	// This function will handle the logic of counting, comparing, syncing and deleting documents
	// between the source and destination databases based on the provided functions.

	const pcgiValidationsCollection = await pcgiValidations.getCollection();

	await replicate<unknown>({

		countDestinationDbFn: async () => {
			return await simplifiedApexLocationsNew.count(
				'*',
				'created_at >= $1 AND created_at <= $2',
				{ 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp },
			);
		},

		countSourceDbFn: async () => {
			const result = await pcgiValidations.count(pcgidbQuery);
			return result;
		},

		deleteDestinationDbFn: async (ids: string[]) => {
			await simplifiedApexLocationsNew.delete(
				'_id IN ($1)',
				{ 1: ids.map(id => `'${id}'`).join(', ') },
			);
		},

		distinctDestinationDbFn: async () => {
			return await simplifiedApexLocationsNew.distinct(
				'_id',
				'created_at >= $1 AND created_at <= $2',
				{ 1: chunkStartDate.unix_timestamp, 2: chunkEndDate.unix_timestamp },
			);
		},

		distinctSourceDbFn: async () => {
			const result = await pcgiValidations.distinct('transaction.transactionId', pcgidbQuery);
			return result.map(String);
		},

		missingDocumentsSourceDbAsyncIterator: (missingDocumentIds) => {
			return pcgiValidationsCollection
				.find({ 'transaction.transactionId': { $in: missingDocumentIds } })
				.stream();
		},

		onCompleteCallbackFn: async () => {
			await writer.flush(invalidateRides);
		},

		writeSourceDocumentToDestinationDbFn: async (sourceDbDocument) => {
			const parseResult = parseSimplifiedApexLocation(sourceDbDocument);
			if (!parseResult) return; // Skip if parsing failed
			await writer.write(parseResult, { flushCallback: invalidateRides });
		},

	});

	//
}
