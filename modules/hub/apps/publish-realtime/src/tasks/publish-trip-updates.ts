/* * */

import { apiCache, GOClickHouseClient } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { pipelinePath, querySqlFromFile } from '@tmlmobilidade/go-hub-pckg-sql';
import { stops } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GtfsRtFeedMessage, HubGtfsRtTripUpdate } from '@tmlmobilidade/types';

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
	// Fetch all stops and build a map of legacy_ids to stop_id

	const allStopsData = await stops.findMany(
		{ projection: { _id: 1, flags: 1 }, sort: { _id: 1 } },
	);

	const allStopsMap = new Map<string, number>();

	for (const stopData of allStopsData) {
		for (const flag of stopData.flags) {
			allStopsMap.set(flag.stop_id, stopData._id);
		}
	}

	//
	// Initialize a new GTFS-RT feed envelope

	const feedResult: GtfsRtFeedMessage = {
		entity: [],
		header: {
			gtfs_realtime_version: '2.0',
			incrementality: 'FULL_DATASET',
			timestamp: Dates.now('Europe/Lisbon').unix_timestamp / 1000,
		},
	};

	//
	// Retrieve GTFS-RT TripUpdate rows from ClickHouse
	// and process the stop_time_update to replace the stop_id
	// with the legacy_id from the stops map.

	const clickhouseTimer = new Timer();

	Logger.info(`Retrieving Estimated Time of Arrivals from ClickHouse...`);

	const clickhouseClient = await GOClickHouseClient.getClient();

	const allTripUpdates = await querySqlFromFile<ClickHouseEtaGtfsResponse>(clickhouseClient, pipelinePath('select-eta-gtfs.sql'));

	allTripUpdates.forEach((row) => {
		// Parse the trip update from the ClickHouse response
		const tripUpdate: HubGtfsRtTripUpdate = JSON.parse(row.trip_update);
		// Process the stop_time_update to replace the stop_id
		// with the legacy_id from the stops map
		for (const stopUpdate of tripUpdate.stop_time_update) {
			const stopId = allStopsMap.get(stopUpdate.stop_id);
			if (!stopId) continue;
			stopUpdate.stop_id = String(stopId);
		}
		// Add the trip update to the feed result
		feedResult.entity.push({ id: row.trip_id, trip_update: tripUpdate });
	});

	Logger.info(`Found ${allTripUpdates.length} trip updates in ${clickhouseTimer.get()}`, 1);

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

	const mlTimer = new Timer();

	Logger.info(`Retrieving Estimated Time of Arrivals from ML API...`);

	const mlTrips = await externalClients.ml.tripUpdates();

	mlTrips.entity.forEach((entity) => {
		// Process the stop_time_update to replace the stop_id
		// with the legacy_id from the stops map
		for (const stopUpdate of entity.trip_update.stop_time_update) {
			const stopId = allStopsMap.get(stopUpdate.stop_id);
			if (!stopId) continue;
			stopUpdate.stop_id = String(stopId);
		}
		// Add the trip update to the feed result
		feedResult.entity.push({ id: entity.id, trip_update: entity.trip_update });
	});

	Logger.info(`Found ${mlTrips.entity.length} ML trips in ${mlTimer.get()}`, 1);

	//
	// Save the result in API Cache

	await apiCache.set('hub:realtime:eta:gtfs', JSON.stringify(feedResult));

	Logger.success(`Finished publishing GTFS-RT TripUpdate feed (${globalTimer.get()})`);

	//
};
