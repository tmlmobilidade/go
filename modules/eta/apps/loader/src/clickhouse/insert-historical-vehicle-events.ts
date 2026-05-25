import { AppConfig } from '@/lib/config.js';
import { Dates } from '@tmlmobilidade/dates';
import { pipelinePath, queryEtaFromFile } from '@tmlmobilidade/go-eta-pckg-common';
import { Logger } from '@tmlmobilidade/logger';
import { performInTimeChunks } from '@tmlmobilidade/utils';

const INSERT_HISTORICAL_VEHICLE_EVENTS_SQL_FILE = 'loader/1-insert-historical-vehicle-events.sql';

/** yyyyMMdd → yyyy-MM-dd for ClickHouse Date params. */
function operationalDateToClickHouseDate(operationalDate: string): string {
	return `${operationalDate.slice(0, 4)}-${operationalDate.slice(4, 6)}-${operationalDate.slice(6, 8)}`;
}

/** Service-day bounds for a wall-clock chunk (matches simplified_vehicle_events ORDER BY prefix). */
function operationalDateBoundsForChunk(chunkStart: number, chunkEnd: number) {
	const start = Dates.fromUnixTimestamp(chunkStart).setZone('Europe/Lisbon', 'offset_only');
	const end = Dates.fromUnixTimestamp(chunkEnd).setZone('Europe/Lisbon', 'offset_only');
	const min = start.operational_date <= end.operational_date ? start.operational_date : end.operational_date;
	const max = start.operational_date >= end.operational_date ? start.operational_date : end.operational_date;
	return {
		operational_date_max: operationalDateToClickHouseDate(max),
		operational_date_min: operationalDateToClickHouseDate(min),
	};
}

export async function insertHistoricalVehicleEvents(clickhouseClient: Parameters<typeof queryEtaFromFile>[0]) {
	//

	Logger.title('3. Insert historical rides vehicle events into clickhouse');

	await performInTimeChunks({
		onChunk: async (chunk) => {
			Logger.progress(`[${chunk.index + 1}/${chunk.total}] - ${Dates.fromUnixTimestamp(chunk.end).iso}[${chunk.end}] › ${Dates.fromUnixTimestamp(chunk.start).iso}[${chunk.start}]`);
			const operationalDates = operationalDateBoundsForChunk(chunk.start, chunk.end);
			await queryEtaFromFile(clickhouseClient, pipelinePath(INSERT_HISTORICAL_VEHICLE_EVENTS_SQL_FILE), {
				chunk_end: chunk.end,
				chunk_start: chunk.start,
				...operationalDates,
			});
		},
		splitBy: { days: AppConfig.historicalVehicleEventsChunkDays },
		startDate: Dates.now('Europe/Lisbon').minus({ days: AppConfig.historicalDataDaysBack }).unix_timestamp,
	});

	Logger.progress(`Inserted historical rides vehicle events into clickhouse`);
	return;
}
