/* * */

import { getOrganizationCacheKey, getOrganizationGtfsResourceId } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { type GtfsHubV1SQLTables, importGtfsHubV1ToDatabase } from '@tmlmobilidade/import-gtfs';

import { syncLinesRoutesPatterns } from './tasks/sync-lines-routes-patterns.js';
import { syncStops } from './tasks/sync-stops.js';

/* * */

async function main() {
	//

	Logger.init();

	const globalTimer = new Timer();

	Logger.info({ message: 'Starting publish schedules process...' });

	const organizations = await goDb.core.organizations.findMany();

	for (const organization of organizations) {
		let importedGtfs: GtfsHubV1SQLTables | undefined;
		try {
			if (!organization.open_data?.services?.gtfs_enabled || !organization.agency_ids.length) {
				const keys = await cacheDb.scan(getOrganizationCacheKey(organization._id, 'network:*'));
				if (keys.length) await cacheDb.deleteMany(keys);
				for (const resource of ['stops', 'lines', 'routes']) {
					await cacheDb.set(getOrganizationCacheKey(organization._id, `network:${resource}`), '[]');
				}
				continue;
			}

			const feed = await storageProvider.findById(getOrganizationGtfsResourceId(organization._id));
			if (!feed?.url) continue;
			importedGtfs = await importGtfsHubV1ToDatabase({
				source: { url: feed.url },
				sqlite_config: { memory: true },
			});

			// Exclude former members even if the archive has not yet been republished.
			const database = importedGtfs._db.databaseInstance;
			const placeholders = organization.agency_ids.map(() => '?').join(',');
			database.prepare(`DELETE FROM routes WHERE agency_id NOT IN (${placeholders})`).run(...organization.agency_ids);
			database.exec('DELETE FROM trips WHERE route_id NOT IN (SELECT route_id FROM routes)');
			database.exec('DELETE FROM stop_times WHERE trip_id NOT IN (SELECT trip_id FROM trips)');
			database.exec('DELETE FROM stops WHERE stop_id NOT IN (SELECT stop_id FROM stop_times)');

			await syncStops(importedGtfs, organization._id, organization.agency_ids);
			await syncLinesRoutesPatterns(importedGtfs, organization._id);
		} catch (error) {
			Logger.error({ error, message: `Error publishing network for organization ${organization._id}.` });
		} finally {
			importedGtfs?._db.cleanup();
		}
	}

	Logger.terminate(`Run took ${globalTimer.get()}`);
}

/* * */

await runOnInterval(main, { intervalMs: '10m', throwOnError: false });
