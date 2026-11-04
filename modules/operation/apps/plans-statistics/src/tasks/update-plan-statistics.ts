/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { PLAN_STATISTICS_VERSION, type PlanStatistics } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { unzipFile } from '@tmlmobilidade/go-utils-zip';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import { calculatePlanStatistics } from '../utils/calculate-plan-statistics.js';

/* * */

export async function updatePlanStatisticsTask() {
	Logger.init();
	const timer = new Timer();
	const plans = await goDb.operation.plans.findMany({
		'$expr': { $and: [
			{ $eq: ['$hash', '$apps.organizer.last_hash'] },
			{ $or: [
				{ $ne: ['$hash', { $ifNull: ['$apps.plans_statistics.last_hash', null] }] },
				{ $ne: [{ $ifNull: ['$apps.plans_statistics.version', null] }, PLAN_STATISTICS_VERSION] },
			] },
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
					version: PLAN_STATISTICS_VERSION,
				},
			} });
			if (!started.matchedCount) continue;

			const temporaryDirectory = fs.mkdtempDisposableSync(path.join(os.tmpdir(), 'plan-statistics-'));
			let statistics: PlanStatistics;
			try {
				const zipPath = path.join(temporaryDirectory.path, 'gtfs.zip');
				const extractedPath = path.join(temporaryDirectory.path, 'extracted');
				const url = await storageProvider.getSignedUrl({ fileId });
				const response = await fetch(url);
				if (!response.ok || !response.body) throw new Error(`Failed to download plan GTFS: HTTP ${response.status}.`);
				await pipeline(response.body, fs.createWriteStream(zipPath));
				await unzipFile(zipPath, extractedPath);
				statistics = await calculatePlanStatistics(path.join(extractedPath, 'trips.txt'));
			} finally {
				temporaryDirectory.remove();
			}

			await collection.updateOne(source, { $set: {
				'apps.plans_statistics': {
					last_hash: plan.hash, message: null, statistics, status: 'complete',
					timestamp: Dates.now('utc').unix_milliseconds,
					version: PLAN_STATISTICS_VERSION,
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
					version: PLAN_STATISTICS_VERSION,
				},
			} });
		}
	}

	Logger.terminate(`Processed ${plans.length} plans in ${timer.get()}.`);
}
