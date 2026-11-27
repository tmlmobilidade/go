/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PlanStatistics, PlanStatisticsSchema } from '@tmlmobilidade/go-types-operation';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';

/* * */

/** Carries the calculated results together with the source identifiers needed to save them safely. */
interface PlanStatisticsWrite {
	file_id: string
	hash: string
	plan_id: string
	statistics: PlanStatistics
}

/* * */

/** Persists calculated results. The task manages processing states through setPlanStatus(). */
export const planStatisticsWriter = new BatchWriter<PlanStatisticsWrite>({
	batch_size: 1,
	insertFn: async (data) => {
		const collection = await goDb.operation.plans.getCollection();

		// Save results only while the plan still matches the imported source.
		for (const item of data) {
			const result = await collection.updateOne({
				'_id': item.plan_id,
				'apps.organizer.last_hash': item.hash,
				'apps.organizer.status': 'complete',
				'attachments.operation_gtfs_normalized': item.file_id,
				'hash': item.hash,
			}, {
				$set: {
					'apps.plans_statistics.message': null,
					'apps.plans_statistics.statistics': PlanStatisticsSchema.parse(item.statistics),
				},
			});

			if (!result.matchedCount) {
				throw new Error(`Source changed while processing statistics for plan "${item.plan_id}".`);
			}
		}
	},
	title: 'operation.plans.statistics',
});
