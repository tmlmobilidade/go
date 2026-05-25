import { AppConfig } from '@/lib/config.js';
import { pipelinePath } from '@/lib/sql-paths.js';
import { queryEachEtaStatementFromFile } from '@/lib/eta-query.js';
import { Logger } from '@tmlmobilidade/logger';

const CLEANUP_CURRENT_VEHICLE_EVENTS_SQL = 'cleanup/2-delete-out-of-window-curr-vehicle-events.sql';

interface CleanupRowsResult {
	rows_to_delete: number
}

export async function cleanupCurrentVehicleEvents(clickhouseClient: Parameters<typeof queryEachEtaStatementFromFile>[0]) {
	Logger.title('3. Cleanup current window vehicle events');

	const result = await queryEachEtaStatementFromFile<CleanupRowsResult>(
		clickhouseClient,
		pipelinePath(CLEANUP_CURRENT_VEHICLE_EVENTS_SQL),
		{
			window_hours_before: AppConfig.windowHoursBefore,
		},
	);

	const rowsToDelete = result[0]?.rows_to_delete ?? 0;
	Logger.progress(`Deleted ${rowsToDelete} out-of-window or orphan current vehicle events`);
	return rowsToDelete;
}
