/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { utcDayChunksNeedingWork } from '../utils/day-coverage.js';

/* * */

const SQL_PATH = sqlPath('hub', 'eta/loader/load-historical-vehicle-events.sql');
const TABLE = 'eta.hist_vehicle_events';

/* * */

/**
 * Loads vehicle events of historical rides into `eta.hist_vehicle_events`,
 * one UTC day at a time, newest first.
 *
 * Only days that need work are processed (see `utcDayChunksNeedingWork`): the
 * newest two (late-arriving pings) and any day still empty. The query itself
 * skips event ids already present, so re-running a day is idempotent.
 *
 * @param windowStart - Inclusive start of the historical window.
 * @param windowEnd - Exclusive end of the historical window.
 */
export async function loadHistoricalVehicleEvents(windowStart: UnixMilliseconds, windowEnd: UnixMilliseconds): Promise<void> {
	const chunks = await utcDayChunksNeedingWork(TABLE, windowStart, windowEnd);

	if (chunks.length === 0) {
		Logger.info({ message: 'hist_vehicle_events is up to date; nothing to load' });
		return;
	}

	for (const [index, chunk] of chunks.entries()) {
		Logger.progress({ message: `[${index + 1}/${chunks.length}] hist_vehicle_events ${chunk.yyyymmdd}` });
		await labDb.queryFromFile(SQL_PATH, { chunk_end: chunk.end, chunk_start: chunk.start });
	}
}
