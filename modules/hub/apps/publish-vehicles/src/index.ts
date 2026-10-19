/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { publishVehiclesPositions } from './tasks/publish-vehicle-positions.js';
import { publishVehiclesMetadata } from './tasks/publish-vehicles-metadata.js';

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

	const organizationsCollection = await goDb.core.organizations.getCollection();
	const organizations = await organizationsCollection.find({ 'agency_ids': { $exists: true }, 'open_data.realtime.vehicles': true }).toArray();

	await publishVehiclesPositions(organizations);

	if (ITERATION % 100 === 0) await publishVehiclesMetadata(organizations); // Every 100 iterations * 1s + execution time

	ITERATION++;

	//
	// Log the total time taken for all tasks

	Logger.terminate(`[${ITERATION}] Publish realtime data completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '1s' });
