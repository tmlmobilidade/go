/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type PlanStatistics } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { type GtfsStrictV30SQLTables, importGtfsToDatabase } from '@tmlmobilidade/go-utils-import-gtfs';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { calculatePlanStatistics } from '../utils/calculate-plan-statistics.js';

/* * */

export async function updatePlanStatisticsTask() {
	Logger.init();
	const timer = new Timer();
	const plans = await goDb.operation.plans.findMany({
		'$expr': { $and: [
			{ $eq: ['$hash', '$apps.organizer.last_hash'] },
			{ $ne: ['$hash', { $ifNull: ['$apps.plans_statistics.last_hash', null] }] },
		] },
		'apps.organizer.status': 'complete',
		'attachments.operation_gtfs_normalized': { $ne: null },
	}, { sort: { active_from: -1 } });

	const collection = await goDb.operation.plans.getCollection();

	for (const plan of plans) {
		const fileId = plan.attachments.operation_gtfs_normalized;
		if (!fileId) continue;

		const source = {
			'_id': plan._id,
			'apps.organizer.last_hash': plan.hash,
			'apps.organizer.status': 'complete',
			'attachments.operation_gtfs_normalized': fileId,
			'hash': plan.hash,
		};

		try {
			const started = await collection.updateOne(source, { $set: {
				'apps.plans_statistics': {
					last_hash: null, message: null, statistics: null, status: 'processing',
					timestamp: Dates.now('utc').unix_milliseconds,
				},
			} });
			if (!started.matchedCount) continue;

			const url = await storageProvider.getSignedUrl({ fileId });
			const gtfs = await importGtfsToDatabase<GtfsStrictV30SQLTables>({
				source: { url },
				sqlite_config: { memory: true },
				time_range: { date_range: { end: plan.active_until, start: plan.active_from } },
			});

			let statistics: PlanStatistics;
			try {
				statistics = calculatePlanStatistics(gtfs);
			} finally {
				gtfs._db.cleanup();
			}

			await collection.updateOne(source, { $set: {
				'apps.plans_statistics': {
					last_hash: plan.hash, message: null, statistics, status: 'complete',
					timestamp: Dates.now('utc').unix_milliseconds,
				},
			} });
		} catch (error) {
			Logger.error({ error, message: `Error calculating statistics for plan "${plan._id}".` });
			await collection.updateOne(source, { $set: {
				'apps.plans_statistics': {
					last_hash: null,
					message: error instanceof Error ? error.message : String(error),
					statistics: null,
					status: 'error',
					timestamp: Dates.now('utc').unix_milliseconds,
				},
			} });
		}
	}

	Logger.terminate(`Processed ${plans.length} plans in ${timer.get()}.`);
}
