/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PLAN_STATISTICS_VERSION } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { readPlanStatistics } from '../utils/read-plan-statistics.js';

/* * */

export async function updatePlanStatisticsTask() {
	Logger.init();
	const timer = new Timer();

	// Select normalized plans whose statistics are missing or outdated.
	const plans = await goDb.operation.plans.findMany({
		'$expr': {
			$and: [
				{ $eq: ['$hash', '$apps.organizer.last_hash'] },
				{
					$or: [
						{ $ne: ['$hash', { $ifNull: ['$apps.plans_statistics.last_hash', null] }] },
						{ $ne: [{ $ifNull: ['$apps.plans_statistics.version', null] }, PLAN_STATISTICS_VERSION] },
					],
				},
			],
		},
		'apps.organizer.status': 'complete',
		'attachments.operation_gtfs_normalized': { $ne: null },
	}, { sort: { active_from: -1 } });

	const collection = await goDb.operation.plans.getCollection();

	for (const plan of plans) {
		const fileId = plan.attachments.operation_gtfs_normalized;
		if (!fileId) continue;

		// Apply updates only while the plan still matches the source being processed.
		const sourceFilter = {
			'_id': plan._id,
			'apps.organizer.last_hash': plan.hash,
			'apps.organizer.status': 'complete',
			'attachments.operation_gtfs_normalized': fileId,
			'hash': plan.hash,
		};

		try {
			const processingUpdate = await collection.updateOne(sourceFilter, {
				$set: {
					'apps.plans_statistics': {
						last_hash: null,
						message: null,
						statistics: null,
						status: 'processing',
						timestamp: Dates.now('utc').unix_milliseconds,
						version: PLAN_STATISTICS_VERSION,
					},
				},
			});
			if (!processingUpdate.matchedCount) continue;

			const statistics = await readPlanStatistics(fileId);

			await collection.updateOne(sourceFilter, {
				$set: {
					'apps.plans_statistics': {
						last_hash: plan.hash,
						message: null,
						statistics,
						status: 'complete',
						timestamp: Dates.now('utc').unix_milliseconds,
						version: PLAN_STATISTICS_VERSION,
					},
				},
			});
		} catch (error) {
			Logger.error({ error, message: `Error calculating statistics for plan "${plan._id}".` });
			await collection.updateOne(sourceFilter, {
				$set: {
					'apps.plans_statistics': {
						last_hash: null,
						message: error instanceof Error ? error.message : String(error),
						statistics: null,
						status: 'error',
						timestamp: Dates.now('utc').unix_milliseconds,
						version: PLAN_STATISTICS_VERSION,
					},
				},
			});
		}
	}

	Logger.terminate(`Processed ${plans.length} plans in ${timer.get()}.`);
}
