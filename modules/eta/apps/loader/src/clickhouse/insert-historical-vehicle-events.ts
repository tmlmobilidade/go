import { pipelinePath } from '@/lib/sql-paths.js';
import { queryFromFile } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';

const INSERT_HISTORICAL_VEHICLE_EVENTS_SQL_FILE = '1-insert-historical-vehicle-events.sql';

export async function insertHistoricalVehicleEvents(clickhouseClient: Parameters<typeof queryFromFile>[0]) {
	//

	Logger.title('3. Insert historical rides vehicle events into clickhouse');

	const result = await queryFromFile(clickhouseClient, pipelinePath(INSERT_HISTORICAL_VEHICLE_EVENTS_SQL_FILE));
	Logger.progress(`Inserted ${result} historical rides vehicle events into clickhouse`);
	return result;
}
