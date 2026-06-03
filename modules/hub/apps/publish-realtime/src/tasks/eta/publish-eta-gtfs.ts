/* * */

import { apiCache, GOClickHouseClient } from '@tmlmobilidade/databases';
import { pipelinePath, querySqlFromFile } from '@tmlmobilidade/go-hub-pckg-sql';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

interface EtaGtfs {
	trip_id: string
	trip_update: string
	vehicle_id: string
}
/* * */

export async function publishEtaGtfs() {
	//

	Logger.title('Publishing GTFS-RT TripUpdate feed...');

	const globalTimer = new Timer();

	//
	// Retrieve GTFS-RT TripUpdate rows from ClickHouse

	const clickhouseClient = await GOClickHouseClient.getClient();
	const allTrips = await querySqlFromFile<EtaGtfs>(clickhouseClient, pipelinePath('select-eta-gtfs.sql'));

	Logger.info(`Retrieved ${allTrips.length} GTFS-RT trip updates...`);

	//
	// Wrap in GTFS-RT feed envelope and parse trip_update JSON for nesting

	const feed = {
		entity: allTrips.map(row => ({
			id: row.trip_id,
			trip_update: JSON.parse(row.trip_update),
		})),
		header: {
			gtfs_realtime_version: '2.0',
			incrementality: 'FULL_DATASET',
			timestamp: Math.floor(Date.now() / 1000),
		},
	};

	//
	// Save the result in API Cache

	await apiCache.set('hub:realtime:eta:gtfs', JSON.stringify(feed));

	Logger.success(`Finished publishing GTFS-RT TripUpdate feed (${globalTimer.get()})`);

	//
};
