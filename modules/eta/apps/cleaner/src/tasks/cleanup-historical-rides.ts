import { AppConfig } from '@/lib/config.js';
import { pipelinePath, qualifiedTable, queryEachEtaStatementFromFile } from '@tmlmobilidade/go-eta-pckg-common';
import { Logger } from '@tmlmobilidade/logger';

const KEEP_TABLE = qualifiedTable(AppConfig.database, '_cleaner_hist_rides_keep');
const CLEANUP_HIST_RIDES_SQL = 'cleanup/4-delete-out-of-window-hist-rides.sql';

interface CleanupRowsResult {
	rows_to_delete: number
}

/**
 * Removes rows from `eta.hist_rides` whose `_id` is not present in
 * `keepRideIds` — the set Mongo currently considers in-window across
 * `[0, historicalDataDaysBack)` days.
 *
 * `keepRideIds` is staged into a dedicated table (`eta._cleaner_hist_rides_keep`)
 * rather than bound as `query_params`, because ClickHouse passes parameters
 * through the request URL and large arrays trip "HTTP request URI invalid
 * or too long". The staging table is truncated and repopulated every run.
 */
export async function cleanupHistoricalRides(
	clickhouseClient: Parameters<typeof queryEachEtaStatementFromFile>[0],
	keepRideIds: string[],
) {
	Logger.title('4. Cleanup out-of-window historical rides');

	if (keepRideIds.length === 0) {
		// Safety net: an empty keep list would delete every row in hist_rides.
		Logger.progress('No historical rides found in current window; skipping cleanup to avoid wiping eta.hist_rides');
		return 0;
	}

	await clickhouseClient.command({
		query: `CREATE TABLE IF NOT EXISTS ${KEEP_TABLE} (_id String) ENGINE = MergeTree() ORDER BY _id`,
	});
	await clickhouseClient.command({ query: `TRUNCATE TABLE ${KEEP_TABLE}` });
	await clickhouseClient.insert({
		format: 'JSONEachRow',
		table: KEEP_TABLE,
		values: keepRideIds.map(_id => ({ _id })),
	});

	const result = await queryEachEtaStatementFromFile<CleanupRowsResult>(
		clickhouseClient,
		AppConfig.database,
		pipelinePath(CLEANUP_HIST_RIDES_SQL),
	);

	const rowsToDelete = result[0]?.rows_to_delete ?? 0;
	Logger.progress(`Deleted ${rowsToDelete} out-of-window historical rides`);
	return rowsToDelete;
}
