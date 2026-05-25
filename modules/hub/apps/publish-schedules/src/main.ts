/* * */

import { generateLinesRoutesPatterns } from '@/tasks/sync-lines-routes-patterns.js';
import { generateStops } from '@/tasks/sync-stops.js';
import { importGtfsToDatabase, type ImportGtfsToDatabaseConfig } from '@tmlmobilidade/import-gtfs-new';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function main() {
	//

	const globalTimer = new Timer();

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

	await generateLinesRoutesPatterns(importedGtfsSql);

	//
	// Finalize the export process

	Logger.terminate(`Run took ${globalTimer.get()}`);

	//
}
