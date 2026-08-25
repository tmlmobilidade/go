/* * */

import { type AppConfig } from '@/lib/config.js';
import { Dates } from '@tmlmobilidade/dates';
import { pipelinePath, queryEtaFromFile } from '@tmlmobilidade/go-eta-pckg-common';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { performInTimeChunks } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function buildHistNodeTravelTimes(clickhouseClient: Parameters<typeof queryEtaFromFile>[0], windowStart: UnixTimestamp, config: AppConfig) {
	await performInTimeChunks({
		intervalHrs: config.historicalTransformationChunkDays * 24,
		onChunk: async (chunk) => {
			Logger.progress(
				{ message: `[${chunk.index + 1}/${chunk.total}] 5a chunk ${Dates.fromUnixTimestamp(chunk.start).iso}[${chunk.start}] -> ${Dates.fromUnixTimestamp(chunk.end).iso}[${chunk.end}]` },
			);
			await queryEtaFromFile(clickhouseClient, pipelinePath('loader/2-build_hist_node_travel_times.sql'), {
				chunk_end: chunk.end,
				chunk_start: chunk.start,
			});
		},
		startDate: windowStart,
	});
}
