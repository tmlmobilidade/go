/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { setPlanStatus } from '@tmlmobilidade/go-operation-pckg-utils';
import { type PlanStatistics } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { calculateGtfsStatistics } from './steps/calculate-gtfs-statistics.js';
import { calculatePlanCost } from './steps/calculate-plan-cost.js';
import { importPlanGtfs } from './steps/import-plan-gtfs.js';
import { planStatisticsWriter } from './writer.js';

/* * */

function resolvePlanCost(totalVkms: number, pricePerKm: unknown): Pick<PlanStatistics, 'plan_cost' | 'price_per_km'> {
	if (!Number.isFinite(totalVkms) || totalVkms < 0) {
		throw new Error('Cannot calculate plan cost: total VKM must be finite and nonnegative.');
	}

	if (pricePerKm == null || (typeof pricePerKm === 'string' && !pricePerKm.trim())) {
		return {
			plan_cost: { amount: null, status: 'missing_configuration' },
			price_per_km: null,
		};
	}

	const rate = typeof pricePerKm === 'string' ? Number(pricePerKm) : pricePerKm;
	if (typeof rate === 'number' && Number.isFinite(rate) && rate >= 0) {
		const amount = calculatePlanCost(totalVkms, rate);
		if (Number.isFinite(amount)) {
			return {
				plan_cost: { amount, status: 'ready' },
				price_per_km: rate,
			};
		}
	}

	return {
		plan_cost: { amount: null, status: 'invalid_configuration' },
		price_per_km: null,
	};
}

/* * */

async function calculateStatisticsFromFile(fileId: string, databasePath: string, startDate: number, endDate: number) {
	const gtfs = await importPlanGtfs(fileId, databasePath);

	try {
		return calculateGtfsStatistics(gtfs, startDate, endDate);
	} finally {
		// Close the connection and keep the SQLite file.
		gtfs._db.databaseInstance.close();
	}
}

/* * */

export async function calculatePlanStatisticsTask() {
	// Select normalized plans whose current hash has not yet been processed.
	const plans = await goDb.operation.plans.findMany({
		'$expr': {
			$and: [
				{ $eq: ['$hash', '$apps.organizer.last_hash'] },
				{ $ne: ['$hash', { $ifNull: ['$apps.plans_statistics.last_hash', null] }] },
			],
		},
		'apps.organizer.status': 'complete',
		'attachments.operation_gtfs_normalized': { $ne: null },
	});

	Logger.info({ message: `Found ${plans.length} plans pending statistics.` });

	const directory = path.join(os.tmpdir(), 'plans-statistics');
	fs.mkdirSync(directory, { recursive: true });

	// Process plans sequentially so only one GTFS import runs at a time.
	for (const plan of plans) {
		const fileId = plan.attachments.operation_gtfs_normalized;
		if (!fileId) continue;

		const databasePath = path.join(directory, `${encodeURIComponent(plan._id)}.db`);

		try {
			await setPlanStatus(plan._id, 'plans_statistics', 'processing');

			Logger.info({ message: `Importing normalized GTFS for plan "${plan._id}" to calculate statistics.` });

			const gtfsStatistics = await calculateStatisticsFromFile(fileId, databasePath, plan.active_from, plan.active_until);
			const agency = await goDb.core.agencies.findById(plan.agency_id, { projection: { 'financials.price_per_km': 1 } });
			const statistics: PlanStatistics = {
				...gtfsStatistics,
				...resolvePlanCost(gtfsStatistics.vkm_count, agency?.financials?.price_per_km),
			};

			await planStatisticsWriter.write({
				file_id: fileId,
				hash: plan.hash,
				plan_id: plan._id,
				statistics,
			});
			await planStatisticsWriter.flush();
			await setPlanStatus(plan._id, 'plans_statistics', 'complete', plan.hash);

			const cost = statistics.plan_cost;
			const costLabel = cost.status === 'ready'
				? new Intl.NumberFormat('pt-PT', { currency: 'EUR', style: 'currency' }).format(cost.amount)
				: cost.status;

			const vkmLabel = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(statistics.vkm_count);

			Logger.success(`Imported plan "${plan._id}" to ${databasePath}. Trips: ${statistics.trip_count}. Lines: ${statistics.line_count}. VKM: ${vkmLabel} km. Estimated cost: ${costLabel}.`);
		} catch (error) {
			Logger.error({ error, message: `Error processing plan "${plan._id}".` });
			await setPlanStatus(plan._id, 'plans_statistics', 'error');
		}
	}
}
