/* * */

import { generateLinesRoutesPatterns } from '@/tasks/sync-lines-routes-patterns.js';
import { generateShapes } from '@/tasks/sync-shapes.js';
import { generateStops } from '@/tasks/sync-stops.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function main() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'publish-network', message: 'Sentry Hub Publish Network initialized', module: 'hub', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Hub Publish Network' });
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	Logger.info({ message: `Starting publish schedules process...` });

	//
	// Set up the import config

	const dbStops = await goDb.infrastructure.stops.findMany({}, { projection: { _id: 1, flags: 1, legacy_ids: 1 } });
	const dbStopsMap = new Map(dbStops.map(stop => [stop._id, stop]));

	Logger.info({ message: `DB Stops: ${JSON.stringify(dbStopsMap.get(100)?.flags)}` });

	// const importConfig: ImportGtfsToDatabaseConfig = {
	// 	source: {
	// 		url: 'https://go.tmlmobilidade.pt/hub/api/v1/plans/gtfs',
	// 	},
	// };

	// const importedGtfsSql = await importGtfsToDatabase(importConfig);

	//
	// Export GTFS files from the merged dataset

	// await generateStops(importedGtfsSql);

	// await generateShapes(importedGtfsSql);

	// await generateLinesRoutesPatterns(importedGtfsSql);

	//
	// Finalize the export process

	Logger.terminate(`Run took ${globalTimer.get()}`);

	//
}
