/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger } from '@tmlmobilidade/logger';

import { type DayChunk, utcDayChunksNeedingWork } from './day-coverage.js';

/* * */

const SQL_PATH = sqlPath('hub', 'eta/loader/build-hist-node-travel-times.sql');
const TABLE = 'eta.hist_node_travel_times';

/* * */

/**
 * Snaps historical vehicle events to shape nodes and writes per-node travel
 * times into `eta.hist_node_travel_times`, one UTC day at a time.
 *
 * Only days that need work are processed (see `utcDayChunksNeedingWork`): the
 * newest two days always, plus any day inside the window with no rows yet.
 * The table is partitioned by UTC day, so a day is rebuilt by dropping its
 * partition and inserting again; re-running is idempotent and never leaves
 * duplicates behind.
 *
 * @param windowStart - Inclusive start of the historical window.
 * @param windowEnd - Exclusive end of the historical window.
 * @returns The chunks that were (re)built, newest first.
 */
export async function buildHistNodeTravelTimes(windowStart: UnixMilliseconds, windowEnd: UnixMilliseconds): Promise<DayChunk[]> {
	const chunks = await utcDayChunksNeedingWork(TABLE, windowStart, windowEnd);

	if (chunks.length === 0) {
		Logger.info({ message: 'hist_node_travel_times is up to date; nothing to build' });
		return [];
	}

	for (const [index, chunk] of chunks.entries()) {
		Logger.progress({
			message: `[${index + 1}/${chunks.length}] hist_node_travel_times ${chunk.yyyymmdd} [${chunk.start} → ${chunk.end})`,
		});

		await labDb.command({ query: `ALTER TABLE ${TABLE} DROP PARTITION ${chunk.yyyymmdd}` });
		await labDb.queryFromFile(SQL_PATH, { chunk_end: chunk.end, chunk_start: chunk.start });
	}

	return chunks;
}
