/* * */

import { Dates } from '@tmlmobilidade/dates';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { DurationObjectUnits, Interval } from 'luxon';

/* * */

interface PerformInTimeChunksOptions {
	onChunk: (chunk: { end: UnixTimestamp, index: number, start: UnixTimestamp, total: number }) => Promise<void>
	splitBy: DurationObjectUnits
	startDate: UnixTimestamp
}

export async function performInTimeChunks({ onChunk, splitBy, startDate }: PerformInTimeChunksOptions) {
	//

	// In order to sync both collections in a manageable way, due to the high volume of data,
	// it is necessary to divide the process into smaller blocks. Instead of syncing all documents at once,
	// divide the process by timestamps chunks and iterate over each one, getting all document IDs from both databases.
	// Like this we can more easily compare the IDs in memory and sync only the missing documents.
	// More recent data is more important than older data, so we start syncing the most recent data first.
	// It makes sense to divide chunks by day, but this should be adjusted according to the volume of data in each chunk.

	const thirtySecondsAgo = Dates
		.now('Europe/Lisbon')
		.minus({ seconds: 30 });

	const earliestDataNeeded = Dates.fromUnixTimestamp(startDate);

	const allTimestampChunks = Interval
		.fromISO(`${earliestDataNeeded.iso}/${thirtySecondsAgo.iso}`)
		.splitBy(splitBy)
		.map(interval => ({ end: interval.end.toMillis(), start: interval.start.toMillis() }))
		.sort((a, b) => b.start - a.start);

	//
	// Iterate over each timestamp chunk and sync the documents.
	// Timestamp chunks are sorted in descending order, so that more recent data is processed first.
	// Timestamp chunks are in the format { start: day1, end: day2 }, so end is always greater than start.
	// This might be confusing as the array of chunks itself is sorted in descending order, but the chunks individually are not.

	for (const [chunkIndex, chunkData] of allTimestampChunks.entries()) {
		//

		const chunkStartDate = Dates
			.fromUnixTimestamp(chunkData.start)
			.setZone('Europe/Lisbon', 'offset_only');

		const chunkEndDate = Dates
			.fromUnixTimestamp(chunkData.end)
			.setZone('Europe/Lisbon', 'offset_only');

		await onChunk({ end: chunkEndDate.unix_timestamp, index: chunkIndex, start: chunkStartDate.unix_timestamp, total: allTimestampChunks.length });
	}

	//
};
