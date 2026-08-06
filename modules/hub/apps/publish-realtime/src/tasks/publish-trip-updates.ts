/* * */

import { Dates } from '@tmlmobilidade/dates';
import { pipelinePath } from '@tmlmobilidade/go-hub-pckg-sql';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type GtfsRtFeedMessage, type GtfsRtTripUpdate } from '@tmlmobilidade/go-types-gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

interface ClickHouseEtaGtfsResponse {
	trip_id: string
	trip_update: string
	vehicle_id: string
}

interface ClickHouseEtaGtfsKeyValue {
	key: string
	value: string
}

/* * */

export async function publishTripUpdates() {
	//

	Logger.title('Publishing GTFS-RT TripUpdate feed...');

	const globalTimer = new Timer();

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
	// Retrieve GTFS-RT TripUpdate rows from ClickHouse.
	// pred_trip_stop_etas already carries GO stop _id (resolved in mv_pred_trip_stop_etas).

	const clickhouseTimer = new Timer();

	Logger.info({ message: `Retrieving Estimated Time of Arrivals from ClickHouse...` });

	const allTripUpdates = await labDb.queryFromFile<ClickHouseEtaGtfsResponse>(pipelinePath('select-eta-gtfs.sql'));

	allTripUpdates.forEach((row) => {
		const tripUpdate: GtfsRtTripUpdate = JSON.parse(row.trip_update);
		feedResult.entity.push({ id: row.trip_id, trip_update: tripUpdate });
	});

	Logger.info({ message: `Found ${allTripUpdates.length} trip updates in ${clickhouseTimer.get()}`, spacesAfterOrBefore: 1 });

	//
	// GTFS-RT TripUpdates grouped by trip

	const byTripTimer = new Timer();

	Logger.info({ message: 'Retrieving GTFS-RT TripUpdates grouped by trip from ClickHouse...' });

	const tripUpdatesByTrip = await labDb.queryFromFile<ClickHouseEtaGtfsKeyValue>(pipelinePath('select-eta-by-trip-gtfs.sql'));

	await Promise.all(tripUpdatesByTrip.map(row => cacheDb.set(`hub:v1:realtime:eta:by-trip:${row.key}:gtfs`, row.value)));

	Logger.info({ message: `Cached ${tripUpdatesByTrip.length} trip GTFS-RT groups in ${byTripTimer.get()}`, spacesAfterOrBefore: 1 });

	//
	// GTFS-RT TripUpdates grouped by stop

	const byStopTimer = new Timer();

	Logger.info({ message: 'Retrieving GTFS-RT TripUpdates grouped by stop from ClickHouse...' });

	const tripUpdatesByStop = await labDb.queryFromFile<ClickHouseEtaGtfsKeyValue>(pipelinePath('select-eta-by-stop-gtfs.sql'));

	await Promise.all(tripUpdatesByStop.map(row => cacheDb.set(`hub:v1:realtime:eta:by-stop:${row.key}:gtfs`, row.value)));

	Logger.info({ message: `Cached ${tripUpdatesByStop.length} stop GTFS-RT groups in ${byStopTimer.get()}`, spacesAfterOrBefore: 1 });

	//
	// CP Trip Updates (Already in GTFS-RT format)

	// Logger.info({ message: `Retrieving Estimated Time of Arrivals from CP API...` });
	// const cpTrips = await externalClients.cp.tripUpdates();

	// feed.entity.push(...cpTrips.entity.map(entity => ({
	// 	id: entity.id,
	// 	trip_update: entity.trip_update,
	// })));
	// Logger.info({ message: `Found ${cpTrips.entity.length} CP trips` }, 1);

	//
	// Mobi Trip Updates (Already in GTFS-RT format)

	// Logger.info({ message: `Retrieving Estimated Time of Arrivals from Mobi API...` });
	// const mobiTrips = await externalClients.mobi.tripUpdates();

	// feed.entity.push(...mobiTrips.entity.map(entity => ({
	// 	id: entity.id,
	// 	trip_update: entity.trip_update,
	// })));
	// Logger.info(`Found ${mobiTrips.entity.length} Mobi trips`, 1);

	//
	// Save the result in API Cache

	await cacheDb.set('hub:v1:realtime:eta:gtfs', JSON.stringify(feedResult));

	Logger.success(`Finished publishing GTFS-RT TripUpdate feed (${globalTimer.get()})`);

	//
};
