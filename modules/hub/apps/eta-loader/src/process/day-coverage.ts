/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';

/* * */

export const DAY_MS = 86_400_000;

export interface DayChunk {
	/** Exclusive end (ms). */
	end: UnixMilliseconds
	/** Inclusive start (ms). */
	start: UnixMilliseconds
	/** UTC day of the chunk as YYYYMMDD; equals the partition id of day-partitioned tables. */
	yyyymmdd: number
}

/* * */

/** Start of the UTC day containing `ms`. */
export function utcDayStart(ms: number): number {
	return Math.floor(ms / DAY_MS) * DAY_MS;
}

/** YYYYMMDD of the UTC day containing `ms`. */
export function utcYyyymmdd(ms: number): number {
	const d = new Date(ms);
	return d.getUTCFullYear() * 10_000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

/**
 * Splits `[windowStart, windowEnd)` into UTC-day chunks, newest first. The
 * first and last chunk may be partial; every other chunk is a full day.
 */
export function utcDayChunks(windowStart: UnixMilliseconds, windowEnd: UnixMilliseconds): DayChunk[] {
	const chunks: DayChunk[] = [];
	for (let dayStart = utcDayStart(windowEnd); dayStart + DAY_MS > windowStart; dayStart -= DAY_MS) {
		const start = Math.max(dayStart, windowStart) as UnixMilliseconds;
		const end = Math.min(dayStart + DAY_MS, windowEnd) as UnixMilliseconds;
		if (end <= start) continue;
		chunks.push({ end, start, yyyymmdd: utcYyyymmdd(dayStart) });
	}
	return chunks;
}

/**
 * Returns the UTC-day chunks of `[windowStart, windowEnd)` that still need
 * processing for a table keyed by `created_at` (ms):
 *
 *  - the newest `alwaysRedoDays` days are always included (the newest day is
 *    partial by definition, and late-arriving pings can land in the previous one);
 *  - any older day with no rows at all is included, so a run interrupted half
 *    way is completed by the next one instead of being skipped by a high-water
 *    mark.
 *
 * Days that already have rows are left alone. Newest first, like the loader.
 */
export async function utcDayChunksNeedingWork(table: string, windowStart: UnixMilliseconds, windowEnd: UnixMilliseconds, alwaysRedoDays = 2): Promise<DayChunk[]> {
	const rows = await labDb.queryFromString<{ yyyymmdd: number | string }>(`
		SELECT DISTINCT toYYYYMMDD(toDateTime(intDiv(created_at, 1000), 'UTC')) AS yyyymmdd
		FROM ${table}
		WHERE created_at >= {window_start:Int64} AND created_at < {window_end:Int64}
	`, { window_end: windowEnd, window_start: windowStart });

	const covered = new Set(rows.map(r => Number(r.yyyymmdd)));
	const redoFrom = utcDayStart(windowEnd) - (alwaysRedoDays - 1) * DAY_MS;

	return utcDayChunks(windowStart, windowEnd).filter(chunk => utcDayStart(chunk.start) >= redoFrom || !covered.has(chunk.yyyymmdd));
}

/**
 * Operational dates (YYYYMMDD, Europe/Lisbon, 04:00 cut-off) that can contain
 * node traversals from the given UTC-day chunks: the local day of the chunk
 * and the one before it (pings between 00:00 and 04:00 local belong to the
 * previous service day).
 */
export function operationalDatesTouchedBy(chunks: DayChunk[]): number[] {
	const dates = new Set<number>();
	for (const chunk of chunks) {
		const noon = utcDayStart(chunk.start) + DAY_MS / 2;
		dates.add(lisbonYyyymmdd(noon));
		dates.add(lisbonYyyymmdd(noon - DAY_MS));
	}
	return [...dates].sort((a, b) => b - a);
}

const lisbonDate = new Intl.DateTimeFormat('en-CA', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Lisbon', year: 'numeric' });

/** YYYYMMDD of the Europe/Lisbon calendar day containing `ms`. */
export function lisbonYyyymmdd(ms: number): number {
	return Number(lisbonDate.format(new Date(ms)).replaceAll('-', ''));
}

/** Unix ms of local (Europe/Lisbon) midnight starting the given YYYYMMDD. */
export function lisbonDayStart(yyyymmdd: number): number {
	const y = Math.floor(yyyymmdd / 10_000);
	const m = Math.floor((yyyymmdd % 10_000) / 100);
	const d = yyyymmdd % 100;
	// Local midnight is UTC midnight shifted by the zone offset (0 or -1 h for Lisbon).
	const utcMidnight = Date.UTC(y, m - 1, d);
	for (const offsetH of [0, 1, -1]) {
		const candidate = utcMidnight - offsetH * 3_600_000;
		if (lisbonYyyymmdd(candidate) === yyyymmdd && lisbonYyyymmdd(candidate - 1) !== yyyymmdd) return candidate;
	}
	return utcMidnight;
}
