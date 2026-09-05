/* * */

import { type ImportGtfsConfig, importGtfsHubV1ToDatabase } from '@tmlmobilidade/import-gtfs';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { generateLinesRoutesPatterns } from './tasks/sync-lines-routes-patterns.js';
import { generateStops } from './tasks/sync-stops.js';

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

	const importConfig: ImportGtfsConfig = {
		source: {
			// url: API_ROUTES.hub.PLANS_GTFS,
			url: 'https://go.tmlmobilidade.pt/hub/api/v1/plans/gtfs',
		},
	};

	const importedGtfsSql = await importGtfsHubV1ToDatabase(importConfig);

	//
	// Export GTFS files from the merged dataset

	await generateStops(importedGtfsSql);

	await generateLinesRoutesPatterns(importedGtfsSql);

	importedGtfsSql._db.cleanup();

	//
	// Finalize the export process

	Logger.terminate(`Run took ${globalTimer.get()}`);

	//
}
