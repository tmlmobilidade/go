/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { planStatisticsWriter } from '../../utils/writer.js';
import { calculatePlanCost } from '../calculate-statistics/calculate-plan-cost.js';
import { calculateTripVkms } from '../calculate-statistics/calculate-trip-vkms.js';
import { countLines } from '../calculate-statistics/count-lines.js';
import { countTrips } from '../calculate-statistics/count-trips.js';
import { importPlanGtfs } from './steps/import-plan-gtfs.js';

/* * */

/** Imports normalized GTFS files, persists their statistics and logs the calculated totals. */
export async function importPlansTask() {
	//
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

	//
	// Keep the database files in the system's temporary directory, one per plan.

	const directory = path.join(os.tmpdir(), 'plans-statistics');
	fs.mkdirSync(directory, { recursive: true });

	//
	// Process plans sequentially so only one GTFS import runs at a time.

	for (const plan of plans) {
		const fileId = plan.attachments.operation_gtfs_normalized;
		if (!fileId) continue;

		const databasePath = path.join(directory, `${encodeURIComponent(plan._id)}.db`);

		try {
			const gtfs = await importPlanGtfs(fileId, databasePath);
			let tripCount: number;
			let lineCount: number;
			let vkmCount: number;

			try {
				// Calculate totals while the imported SQLite connection is still open.
				tripCount = countTrips(gtfs);
				lineCount = countLines(gtfs);
				vkmCount = calculateTripVkms(gtfs, plan.active_from, plan.active_until)
					.reduce((total, trip) => total + trip.vkm, 0);
			} finally {
				// Close without cleanup(), which would also delete the SQLite file.
				gtfs._db.databaseInstance.close();
			}

			// Read the current rate from the operator associated with this plan.
			const agency = await goDb.core.agencies.findById(plan.agency_id, { projection: { 'financials.price_per_km': 1 } });
			const cost = calculatePlanCost(vkmCount, agency?.financials?.price_per_km);

			// Persist the totals and applied rate, flushing before leaving this task run.
			await planStatisticsWriter.write({
				file_id: fileId,
				hash: plan.hash,
				plan_id: plan._id,
				statistics: {
					line_count: lineCount,
					plan_cost: cost,
					price_per_km: cost.status === 'ready' ? Number(agency?.financials?.price_per_km) : null,
					trip_count: tripCount,
					vkm_count: vkmCount,
				},
			});
			await planStatisticsWriter.flush();

			const costLabel = cost.status === 'ready'
				? new Intl.NumberFormat('pt-PT', { currency: 'EUR', style: 'currency' }).format(cost.amount)
				: cost.status;

			const vkmLabel = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(vkmCount);

			Logger.success(`Imported plan "${plan._id}" to ${databasePath}. Trips: ${tripCount}. Lines: ${lineCount}. VKM: ${vkmLabel} km. Estimated cost: ${costLabel}.`);
			break;
		} catch (error) {
			Logger.error({ error, message: `Error processing plan "${plan._id}".` });
		}
	}
}
