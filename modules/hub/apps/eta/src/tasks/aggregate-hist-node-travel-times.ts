/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger } from '@tmlmobilidade/logger';

import { type DayChunk, HOUR_MS, lisbonDayStart, operationalDatesTouchedBy } from '../utils/day-coverage.js';

/* * */

const SQL_PATH = sqlPath('hub', 'eta/loader/aggregate-hist-node-travel-times.sql');

/** Hours scanned before local midnight; covers the 04:00 operational cut-off with margin. */
const SCAN_BEFORE_HOURS = 16;

/** Hours scanned after local midnight; covers the full operational day plus the next morning. */
const SCAN_AFTER_HOURS = 42;

/* * */

/**
 * Aggregates per-node travel times in `eta.hist_node_travel_times` into
 * operational-day buckets, one operational day at a time.
 *
 * Only the operational days that can contain rows from the given rebuilt
 * UTC-day chunks are aggregated. The target table is a ReplacingMergeTree
 * keyed by the group columns, so re-aggregating a day supersedes its
 * previous rows.
 *
 * Each run of the query scans a generous `created_at` window around the local
 * day and selects the exact rows by operational date inside the query.
 *
 * @param rebuiltChunks - UTC-day chunks written by `buildHistNodeTravelTimes`.
 */
export async function aggregateHistNodeTravelTimes(rebuiltChunks: DayChunk[]): Promise<void> {
	const operationalDates = operationalDatesTouchedBy(rebuiltChunks);

	if (operationalDates.length === 0) {
		Logger.info({ message: 'No operational days to aggregate' });
		return;
	}

	for (const [index, chunkDate] of operationalDates.entries()) {
		const dayStart = lisbonDayStart(chunkDate);
		Logger.progress({ message: `[${index + 1}/${operationalDates.length}] operational day ${chunkDate}` });
		await labDb.queryFromFile(SQL_PATH, {
			chunk_date: chunkDate,
			scan_end: dayStart + SCAN_AFTER_HOURS * HOUR_MS,
			scan_start: dayStart - SCAN_BEFORE_HOURS * HOUR_MS,
		});
	}
}
