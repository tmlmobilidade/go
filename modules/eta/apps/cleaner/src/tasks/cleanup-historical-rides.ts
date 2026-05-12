import { pipelinePath } from '@/lib/sql-paths.js';
import { queryEachStatementFromFile, splitClickHouseStatements } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';
import { readFile } from 'node:fs/promises';

const CLEANUP_HIST_RIDES_SQL = 'cleanup/4-delete-out-of-window-hist-rides.sql';

interface CleanupRowsResult {
	rows_to_delete: number
}

/**
 * Removes any rows from `eta.hist_rides` whose `_id` is not present in
 * `keepRideIds` — the set of rides Mongo currently considers in-window
 * across `[0, historicalDataDaysBack)` days.
 *
 * `query_params` for the Array(String) placeholder is not supported by the
 * shared `queryEachStatementFromFile` wrapper (its param type is restricted
 * to scalars), so the SQL file is split and each statement is run directly
 * against the client.
 */
export async function cleanupHistoricalRides(
	clickhouseClient: Parameters<typeof queryEachStatementFromFile>[0],
	keepRideIds: string[],
) {
	Logger.title('4. Cleanup out-of-window historical rides');

	if (keepRideIds.length === 0) {
		// Safety net: an empty keep list would delete every row in hist_rides.
		Logger.progress('No historical rides found in current window; skipping cleanup to avoid wiping eta.hist_rides');
		return 0;
	}

	const sql = await readFile(pipelinePath(CLEANUP_HIST_RIDES_SQL), 'utf-8');
	const statements = splitClickHouseStatements(sql);

	let rowsToDelete = 0;
	for (const statement of statements) {
		const resultSet = await clickhouseClient.query({
			format: 'JSONEachRow',
			query: statement,
			query_params: { keep_ride_ids: keepRideIds },
		});
		const rows = await resultSet.json<CleanupRowsResult>();
		if (rows[0]?.rows_to_delete !== undefined) {
			rowsToDelete = Number(rows[0].rows_to_delete);
		}
	}

	Logger.progress(`Deleted ${rowsToDelete} out-of-window historical rides`);
	return rowsToDelete;
}
