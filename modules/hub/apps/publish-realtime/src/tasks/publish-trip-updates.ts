/* * */

import { apiCache, GOClickHouseClient } from '@tmlmobilidade/databases';
import { externalClients } from '@tmlmobilidade/external';
import { pipelinePath, querySqlFromFile } from '@tmlmobilidade/go-hub-pckg-sql';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

interface ClickHouseEtaGtfsResponse {
	trip_id: string
	trip_update: string
	vehicle_id: string
}
/* * */

export async function publishTripUpdates() {
	//

	Logger.title('Publishing GTFS-RT TripUpdate feed...');

	const globalTimer = new Timer();

	//
	// Retrieve GTFS-RT TripUpdate rows from ClickHouse

	Logger.info(`Retrieving Estimated Time of Arrivals from ClickHouse...`);
	const clickhouseClient = await GOClickHouseClient.getClient();
	const allTrips = await querySqlFromFile<ClickHouseEtaGtfsResponse>(clickhouseClient, pipelinePath('select-eta-gtfs.sql'));
	Logger.info(`Found ${allTrips.length} trips`, 1);

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
	// CP Trip Updates (Already in GTFS-RT format)

	// Logger.info(`Retrieving Estimated Time of Arrivals from CP API...`);
	// const cpTrips = await externalClients.cp.tripUpdates();

	// feed.entity.push(...cpTrips.entity.map(entity => ({
	// 	id: entity.id,
	// 	trip_update: entity.trip_update,
	// })));
	// Logger.info(`Found ${cpTrips.entity.length} CP trips`, 1);

	//
	// Mobi Trip Updates (Already in GTFS-RT format)

	// Logger.info(`Retrieving Estimated Time of Arrivals from Mobi API...`);
	// const mobiTrips = await externalClients.mobi.tripUpdates();

	// feed.entity.push(...mobiTrips.entity.map(entity => ({
	// 	id: entity.id,
	// 	trip_update: entity.trip_update,
	// })));
	// Logger.info(`Found ${mobiTrips.entity.length} Mobi trips`, 1);

	//
	// ML Trip Updates (Already in GTFS-RT format)

	Logger.info(`Retrieving Estimated Time of Arrivals from ML API...`);
	const mlTrips = await externalClients.ml.tripUpdates();

	feed.entity.push(...mlTrips.entity.map(entity => ({
		id: entity.id,
		trip_update: entity.trip_update,
	})));
	Logger.info(`Found ${mlTrips.entity.length} ML trips`, 1);

	//
	// Save the result in API Cache

	await apiCache.set('hub:realtime:eta:gtfs', JSON.stringify(feed));

	Logger.success(`Finished publishing GTFS-RT TripUpdate feed (${globalTimer.get()})`);

	//
};
