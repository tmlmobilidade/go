/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/* * */

const SQL_PATH = sqlPath('hub', 'eta/loader/load-rides.sql');

/* * */

interface LoadRidesOptions {
	/** Agencies whose rides are loaded. */
	agencyIds: string[]
	/** Only load rides with a passing coverage grade. */
	requirePass: boolean
	/** Skip rides already present in the target table. */
	skipExisting: boolean
	/** Target table, without the database prefix. */
	tableName: 'curr_rides' | 'hist_rides'
	/** Exclusive end of the window on `start_time_scheduled`. */
	windowEnd: UnixMilliseconds
	/** Inclusive start of the window on `start_time_scheduled`. */
	windowStart: UnixMilliseconds
}

/* * */

/**
 * Loads rides from `operation.rides` into an ETA rides table.
 *
 * The same query serves both tables: current rides are still changing
 * (observed start/end times), so the whole window is re-inserted and the
 * ReplacingMergeTree keeps the newest version per ride; historical rides are
 * final, so only pass-grade rides not already present are inserted.
 *
 * @param options - Window, target table and filters.
 */
export async function loadRides(options: LoadRidesOptions): Promise<void> {
	await labDb.queryFromFile(SQL_PATH, {
		agency_ids: options.agencyIds.join(','),
		line_ids: '',
		require_pass: options.requirePass ? 1 : 0,
		skip_existing: options.skipExisting ? 1 : 0,
		table_name: options.tableName,
		time_end: options.windowEnd,
		time_start: options.windowStart,
	});

	Logger.progress({ message: `Loaded rides: ${options.tableName}` });
}
