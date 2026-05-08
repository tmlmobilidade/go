import { AppConfig } from '@/lib/config.js';
import { pipelinePath } from '@/lib/sql-paths.js';
import { queryEachStatementFromFile } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';

const CLEANUP_CURRENT_RIDES_SQL = 'cleanup/1-delete-out-of-window-curr-rides.sql';

interface CleanupRowsResult {
	rows_to_delete: number
}

export async function cleanupCurrentRides(clickhouseClient: Parameters<typeof queryEachStatementFromFile>[0]) {
	Logger.title('1. Cleanup current window rides');

	const result = await queryEachStatementFromFile<CleanupRowsResult>(
		clickhouseClient,
		pipelinePath(CLEANUP_CURRENT_RIDES_SQL),
		{
			window_hours_after: AppConfig.windowHoursAfter,
			window_hours_before: AppConfig.windowHoursBefore,
		},
	);

	const rowsToDelete = result[0]?.rows_to_delete ?? 0;
	Logger.progress(`Deleted ${rowsToDelete} out-of-window current rides`);
	return rowsToDelete;
}
