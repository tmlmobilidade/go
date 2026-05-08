import { pipelinePath } from '@/lib/sql-paths.js';
import { queryEachStatementFromFile } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';

const CLEANUP_CURRENT_WAYPOINTS_SQL = 'cleanup/3-delete-orphan-curr-waypoints.sql';

interface CleanupRowsResult {
	rows_to_delete: number
}

export async function cleanupCurrentWaypoints(clickhouseClient: Parameters<typeof queryEachStatementFromFile>[0]) {
	Logger.title('2. Cleanup current window waypoints');

	const result = await queryEachStatementFromFile<CleanupRowsResult>(
		clickhouseClient,
		pipelinePath(CLEANUP_CURRENT_WAYPOINTS_SQL),
	);

	const rowsToDelete = result[0]?.rows_to_delete ?? 0;
	Logger.progress(`Deleted ${rowsToDelete} orphan current waypoints`);
	return rowsToDelete;
}
