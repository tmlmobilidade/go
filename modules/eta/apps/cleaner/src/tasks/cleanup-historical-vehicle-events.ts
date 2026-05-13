import { pipelinePath } from '@/lib/sql-paths.js';
import { queryEachStatementFromFile } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';

const CLEANUP_HIST_VEHICLE_EVENTS_SQL = 'cleanup/5-delete-orphan-hist-vehicle-events.sql';

interface CleanupRowsResult {
	rows_to_delete: number
}

/**
 * Removes vehicle events whose parent ride no longer exists in
 * `eta.hist_rides`. Must run AFTER `cleanupHistoricalRides` so the orphan
 * predicate (`ride_id NOT IN (SELECT _id FROM eta.hist_rides)`) is
 * evaluated against the pruned ride set.
 */
export async function cleanupHistoricalVehicleEvents(clickhouseClient: Parameters<typeof queryEachStatementFromFile>[0]) {
	Logger.title('5. Cleanup orphan historical vehicle events');

	const result = await queryEachStatementFromFile<CleanupRowsResult>(
		clickhouseClient,
		pipelinePath(CLEANUP_HIST_VEHICLE_EVENTS_SQL),
	);

	const rowsToDelete = result[0]?.rows_to_delete ?? 0;
	Logger.progress(`Deleted ${rowsToDelete} orphan historical vehicle events`);
	return rowsToDelete;
}
