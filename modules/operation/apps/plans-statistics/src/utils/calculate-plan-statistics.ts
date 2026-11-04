/* * */

import { type PlanStatistics, PlanStatisticsSchema } from '@tmlmobilidade/go-types-operation';
import { streamCsvFile } from '@tmlmobilidade/go-utils-exec';

/* * */

/** Counts CSV data records, excluding the header and empty lines. */
export async function calculatePlanStatistics(tripsFilePath: string): Promise<PlanStatistics> {
	let tripCount = 0;

	await streamCsvFile(tripsFilePath, async () => {
		tripCount += 1;
	});

	return PlanStatisticsSchema.parse({ trip_count: tripCount });
}
