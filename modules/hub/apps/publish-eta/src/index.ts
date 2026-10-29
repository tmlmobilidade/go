/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { publishTripUpdates } from './tasks/gtfs/publish-trip-updates.js';
import { publishEtas } from './tasks/simplified/publish-etas.js';

/* * */

let ITERATION = 0;

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();
	Logger.title(`[${ITERATION}] Publishing realtime data...`);

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	if (ITERATION % 15 === 0) {
		const agencies = await goDb.core.agencies.findMany({ 'open_data.services.eta_enabled': true }, { projection: { _id: 1 } });

		for (const agency of agencies) {
			await Promise.all([publishEtas(agency._id), publishTripUpdates(agency._id)]);
		}

		// Keep global feeds available for existing consumers.
		await Promise.all([
			publishEtas(), // Every 15 iterations * 1s + execution time ≈ 30 seconds
			publishTripUpdates(), // Every 15 iterations * 1s + execution time ≈ 30 seconds
		]);
	}

	ITERATION++;

	//
	// Log the total time taken for all tasks

	Logger.terminate(`[${ITERATION}] Publish realtime data completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '1s' });
