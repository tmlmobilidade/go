/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PlanStatistics, PlanStatisticsSchema } from '@tmlmobilidade/go-types-operation';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

/* * */

/** Carries the calculated results together with the source identifiers needed to save them safely. */
interface PlanStatisticsWrite {
	file_id: string
	hash: string
	plan_id: string
	statistics: PlanStatistics
}

/* * */

/** Persists completed results in operation.plans using the shared BatchWriter mechanism. */
export const planStatisticsWriter = new BatchWriter<PlanStatisticsWrite>({
	batch_size: 1,
	insertFn: async (data) => {
		const collection = await goDb.operation.plans.getCollection();

		// Validate and save results only while the plan still matches the imported source.
		// Updating this app alone preserves the remaining plan data.
		for (const item of data) {
			const result = await collection.updateOne({
				'_id': item.plan_id,
				'apps.organizer.last_hash': item.hash,
				'apps.organizer.status': 'complete',
				'attachments.operation_gtfs_normalized': item.file_id,
				'hash': item.hash,
			}, {
				$set: {
					'apps.plans_statistics': {
						last_hash: item.hash,
						message: null,
						statistics: PlanStatisticsSchema.parse(item.statistics),
						status: 'complete',
						timestamp: Date.now(),
					},
				},
			});

			if (!result.matchedCount) {
				Logger.info({ message: `Skipped statistics for changed plan "${item.plan_id}".` });
			}
		}
	},
	title: 'operation.plans.statistics',
});
