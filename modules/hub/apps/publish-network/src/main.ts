/* * */

import { generateLinesRoutesPatterns } from '@/tasks/sync-lines-routes-patterns.js';
import { generateShapes } from '@/tasks/sync-shapes.js';
import { generateStops } from '@/tasks/sync-stops.js';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
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
		Logger.error('Error initializing Sentry Hub Publish Network', error);
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	Logger.info(`Starting publish schedules process...`);

	//
	// Set up the import config

	const importConfig: ImportGtfsToDatabaseConfig = {
		source: {
			url: 'https://go.tmlmobilidade.pt/hub/api/v1/plans/gtfs',
		},
	};

	const importedGtfsSql = await importGtfsToDatabase(importConfig);

	//
	// Export GTFS files from the merged dataset

	await generateStops(importedGtfsSql);

	await generateShapes(importedGtfsSql);

	await generateLinesRoutesPatterns(importedGtfsSql);

	//
	// Finalize the export process

	Logger.terminate(`Run took ${globalTimer.get()}`);

	//
}
