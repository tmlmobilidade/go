/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { removeOldGtfsValidationsTask } from './tasks/gtfs-validations/remove-old-gtfs-validations.js';
import { normalizePlansTask } from './tasks/plans/normalize-plans/normalize-plans.js';
import { updatePlanHashesTask } from './tasks/plans/update-plan-hashes/update-plan-hashes.js';
import { removeOrphanAnalysesTask } from './tasks/rides/remove-orphan-analyses.js';
import { removeOrphanHashedShapesTask } from './tasks/rides/remove-orphan-hashed-shapes.js';
import { removeOrphanHashedTripsTask } from './tasks/rides/remove-orphan-hashed-trips.js';
import { removeOrphanRidesTask } from './tasks/rides/remove-orphan-rides.js';

/* * */

async function reprocessStuckRides() {
	//

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	/* * */
	/* GTFS VALIDATIONS */

	await removeOldGtfsValidationsTask();

	/* * */
	/* PLANS */

	await updatePlanHashesTask();
	await normalizePlansTask();

	/* * */
	/* RIDES */

	await removeOrphanRidesTask();
	// await removeOrphanHashedShapesTask();
	// await removeOrphanHashedTripsTask();
	// await removeOrphanAnalysesTask();

	/* * */

	Logger.terminate(`Run took ${globalTimer.get()}.`);

	//
};

/* * */

await runOnInterval(reprocessStuckRides, { intervalMs: '10m' });
