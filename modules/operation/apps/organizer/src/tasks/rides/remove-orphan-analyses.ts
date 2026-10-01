/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { RideAnalysesRegistrySchema } from '@tmlmobilidade/go-types-operation';
import { runWithConcurrency } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Delete all Ride Analyses from Rides that do not exist anymore.
 */
export async function removeOrphanAnalysesTask() {
	//

	const timer = new Timer();

	Logger.spacer(1);
	Logger.info({ message: `Starting cleanup of orphan Ride Analyses...` });

	const rideAnalysisTables = Object
		.keys(RideAnalysesRegistrySchema.shape)
		.map(table => `operation.ride_analysis_${table}`);

	await runWithConcurrency(rideAnalysisTables, rideAnalysisTables.length, async (table) => {
		await labDb.command({
			query: `
				ALTER TABLE ${table}
				DELETE WHERE ride_id NOT IN (
					SELECT _id
					FROM operation.rides
				);
			`,
		});
	});

	Logger.success(`Deleted orphan Ride Analyses. (${timer.get()})`);
	Logger.spacer(1);
}
