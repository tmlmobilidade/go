/* * */

import type { AppConfig } from '@/lib/config.js';

import { Dates } from '@tmlmobilidade/dates';
import { pipelinePath, queryEtaFromFile } from '@tmlmobilidade/go-eta-pckg-common';
import { Logger } from '@tmlmobilidade/logger';
import { UnixTimestamp } from '@tmlmobilidade/types';
import { performInTimeChunks } from '@tmlmobilidade/utils';

/* * */

export async function buildHistNodeTravelTimes(clickhouseClient: Parameters<typeof queryEtaFromFile>[0], windowStart: UnixTimestamp, config: AppConfig) {
	await performInTimeChunks({
		onChunk: async (chunk) => {
			Logger.progress(
				`[${chunk.index + 1}/${chunk.total}] 5a chunk ${Dates.fromUnixTimestamp(chunk.start).iso}[${chunk.start}] -> ${Dates.fromUnixTimestamp(chunk.end).iso}[${chunk.end}]`,
			);
			await queryEtaFromFile(clickhouseClient, pipelinePath('loader/2-build_hist_node_travel_times.sql'), {
				chunk_end: chunk.end,
				chunk_start: chunk.start,
			});
		},
		splitBy: { days: config.historicalTransformationChunkDays },
		startDate: windowStart,
	});
}
