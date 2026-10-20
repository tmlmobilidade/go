/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { publishVehiclesPositions } from './tasks/publish-vehicle-positions.js';
import { publishVehiclesMetadata } from './tasks/publish-vehicles-metadata.js';

/* * */

const ITERATION = 0;

async function main() {
	//

	//
	// Initialize the logger

	Logger.init();
	Logger.title(`[${ITERATION}] Publishing realtime data...`);

	const globalTimer = new Timer();

	//
	// Run all tasks sequentially

	const agencies = await goDb.core.agencies.findMany({ 'services.positions_enabled': true }, { projection: { _id: 1, name: 1 } });

	for (const agency of agencies) {
		Logger.title(`Publishing realtime vehicles positions for agency ${agency._id} - ${agency.name}...`);

		await publishVehiclesPositions(agency._id);
		if (ITERATION % 100 === 0) await publishVehiclesMetadata(agency._id);

		Logger.success({ message: `Finished publishing realtime vehicles positions for agency ${agency._id} - ${agency.name} (${globalTimer.get()})` });
	}

	//
	// Log the total time taken for all tasks

	Logger.terminate(`[${ITERATION}] Publish realtime data completed in ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '1s' });
