import { AppConfig } from '@/lib/config.js';
import { pipelinePath, queryEachEtaStatementFromFile } from '@tmlmobilidade/go-eta-pckg-common';
import { Logger } from '@tmlmobilidade/logger';

const CLEANUP_CURRENT_WAYPOINTS_SQL = 'cleanup/3-delete-orphan-curr-waypoints.sql';

interface CleanupRowsResult {
	rows_to_delete: number
}

export async function cleanupCurrentWaypoints(clickhouseClient: Parameters<typeof queryEachEtaStatementFromFile>[0]) {
	Logger.title('2. Cleanup current window waypoints');

	const result = await queryEachEtaStatementFromFile<CleanupRowsResult>(
		clickhouseClient,
		AppConfig.database,
		pipelinePath(CLEANUP_CURRENT_WAYPOINTS_SQL),
	);

	const rowsToDelete = result[0]?.rows_to_delete ?? 0;
	Logger.progress(`Deleted ${rowsToDelete} orphan current waypoints`);
	return rowsToDelete;
}
