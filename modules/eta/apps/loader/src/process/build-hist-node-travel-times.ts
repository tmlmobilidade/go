import { AppConfig } from '@/lib/config.js';
import { pipelinePath } from '@/lib/sql-paths.js';
import { queryFromFile } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { performInTimeChunks } from '@tmlmobilidade/utils';

export async function buildHistNodeTravelTimes(clickhouseClient, windowStart: UnixTimestamp) {
	await performInTimeChunks({
		onChunk: async (chunk) => {
			Logger.progress(
				`[${chunk.index + 1}/${chunk.total}] 5a chunk ${Dates.fromUnixTimestamp(chunk.start).iso}[${chunk.start}] -> ${Dates.fromUnixTimestamp(chunk.end).iso}[${chunk.end}]`,
			);
			await queryFromFile(clickhouseClient, pipelinePath('loader/2-build_hist_node_travel_times.sql'), {
				chunk_end: chunk.end,
				chunk_start: chunk.start,
			});
		},
		splitBy: { days: AppConfig.historicalTransformationChunkDays },
		startDate: windowStart,
	});
}
