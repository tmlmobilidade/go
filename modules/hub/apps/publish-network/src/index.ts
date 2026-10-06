/* * */

import { getOrganizationGtfsResourceId } from '@tmlmobilidade/go-hub-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { type GtfsHubV1SQLTables, importGtfsHubV1ToDatabase } from '@tmlmobilidade/import-gtfs';

import { syncLinesRoutesPatterns } from './tasks/sync-lines-routes-patterns.js';
import { syncStops } from './tasks/sync-stops.js';
import { mergeGtfsTables } from './utils/merge-gtfs-tables.js';

/* * */

async function main() {
	//

	Logger.init();

	const globalTimer = new Timer();

	Logger.info({ message: 'Starting publish schedules process...' });

	const organizations = await goDb.core.organizations.findMany({ 'open_data.services.gtfs_enabled': true });
	let mergedGtfs: GtfsHubV1SQLTables | null = null;

	try {
		//
		// Combine published organization feeds before updating the global network.

		for (const organization of organizations) {
			const feed = await storageProvider.findById(getOrganizationGtfsResourceId(organization._id));
			if (!feed?.url) continue;

			const importedGtfs = await importGtfsHubV1ToDatabase({
				source: { url: feed.url },
				sqlite_config: { memory: true },
			});

			if (!mergedGtfs) {
				mergedGtfs = importedGtfs;
				continue;
			}

			try {
				await mergeGtfsTables(mergedGtfs, importedGtfs);
			} finally {
				importedGtfs._db.cleanup();
			}
		}

		if (!mergedGtfs) return Logger.terminate('No published organization GTFS feeds found.');

		await syncStops(mergedGtfs);
		await syncLinesRoutesPatterns(mergedGtfs);
	} finally {
		mergedGtfs?._db.cleanup();
	}

	Logger.terminate(`Run took ${globalTimer.get()}`);
}

/* * */

await runOnInterval(main, { intervalMs: '10m', throwOnError: false });
