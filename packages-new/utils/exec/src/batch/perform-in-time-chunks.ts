/* * */

import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { Dates, splitTimeIntervals } from '@tmlmobilidade/go-utils-dates';

/* * */

export interface PerformInTimeChunksItem {
	end: UnixMilliseconds
	index: number
	start: UnixMilliseconds
	total: number
}

export interface PerformInTimeChunksOptions {
	endDate?: UnixMilliseconds
	intervalHrs: number
	onChunk: (chunk: PerformInTimeChunksItem) => Promise<void>
	order: 'asc' | 'desc'
	startDate: UnixMilliseconds
}

export async function performInTimeChunks({ endDate, intervalHrs, onChunk, order, startDate }: PerformInTimeChunksOptions) {
	//

	// In order to sync both collections in a manageable way, due to the high volume of data,
	// it is necessary to divide the process into smaller blocks. Instead of syncing all documents at once,
	// divide the process by timestamps chunks and iterate over each one, getting all document IDs from both databases.
	// Like this we can more easily compare the IDs in memory and sync only the missing documents.
	// More recent data is more important than older data, so we start syncing the most recent data first.
	// It makes sense to divide chunks by day, but this should be adjusted according to the volume of data in each chunk.

	const endDateValue = endDate || Dates.now('utc').minus({ seconds: 30 }).unix_milliseconds;

	const allTimestampChunks = splitTimeIntervals(startDate, endDateValue, intervalHrs, order);

	//
	// Iterate over each timestamp chunk and sync the documents.
	// Timestamp chunks are sorted in descending order, so that more recent data is processed first.
	// Timestamp chunks are in the format { start: day1, end: day2 }, so end is always greater than start.
	// This might be confusing as the array of chunks itself is sorted in descending order, but the chunks individually are not.

	for (const [chunkIndex, chunkData] of allTimestampChunks.entries()) {
		await onChunk({
			end: chunkData.end,
			index: chunkIndex,
			start: chunkData.start,
			total: allTimestampChunks.length,
		});
	}

	//
};
