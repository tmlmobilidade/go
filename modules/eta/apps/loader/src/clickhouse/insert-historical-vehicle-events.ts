import { AppConfig } from '@/lib/config.js';
import { pipelinePath } from '@/lib/sql-paths.js';
import { queryFromFile } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { performInTimeChunks } from '@tmlmobilidade/utils';

const INSERT_HISTORICAL_VEHICLE_EVENTS_SQL_FILE = 'loader/1-insert-historical-vehicle-events.sql';

export async function insertHistoricalVehicleEvents(clickhouseClient: Parameters<typeof queryFromFile>[0]) {
	//

	Logger.title('3. Insert historical rides vehicle events into clickhouse');

	await performInTimeChunks({
		onChunk: async (chunk) => {
			Logger.progress(`[${chunk.index + 1}/${chunk.total}] - ${Dates.fromUnixTimestamp(chunk.end).iso}[${chunk.end}] › ${Dates.fromUnixTimestamp(chunk.start).iso}[${chunk.start}]`);
			await queryFromFile(clickhouseClient, pipelinePath(INSERT_HISTORICAL_VEHICLE_EVENTS_SQL_FILE), {
				chunk_end: chunk.end,
				chunk_start: chunk.start,
			});
		},
		splitBy: { days: AppConfig.historicalVehicleEventsChunkDays },
		startDate: Dates.now('Europe/Lisbon').minus({ days: AppConfig.historicalDataDaysBack }).unix_timestamp,
	});

	Logger.progress(`Inserted historical rides vehicle events into clickhouse`);
	return;
}
