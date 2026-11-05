/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { calculateTripVkms } from '../calculate-statistics/calculate-trip-vkms.js';
import { countLines } from '../calculate-statistics/count-lines.js';
import { countTrips } from '../calculate-statistics/count-trips.js';
import { importPlanGtfs } from './steps/import-plan-gtfs.js';

/* * */

interface PlanStatics {
	line_count: number
	plan_cost: number
	trip_count: number
	vkm_count: number
}

/** Imports normalized plan GTFS files and logs trip, line and VKM totals. */
export async function importPlansTask() {
	//
	// Only import plans whose organizer has finished processing the current hash.

	const plans = await goDb.operation.plans.findMany({
		'$expr': { $eq: ['$hash', '$apps.organizer.last_hash'] },
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

			Logger.success(`Imported plan "${plan._id}" to ${databasePath}. Trips: ${tripCount}. Lines: ${lineCount}. VKM: ${vkmCount}.`);
			break;
		} catch (error) {
			// An import failure must not prevent the remaining plans from being processed.
			Logger.error({ error, message: `Error processing plan "${plan._id}".` });
		}
	}
}
