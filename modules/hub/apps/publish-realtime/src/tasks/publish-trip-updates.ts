/* * */

import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { pipelinePath } from '@tmlmobilidade/go-hub-pckg-sql';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type GtfsRtFeedMessage, type GtfsRtTripUpdate } from '@tmlmobilidade/go-types-gtfs-rt';
import { type HubPlan } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { getPublicTripId } from '@tmlmobilidade/utils';

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

const CP_AGENCY_ID = 'N18KL';

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

	const cpTimer = new Timer();

	Logger.info({ message: 'Retrieving Estimated Time of Arrivals from CP API...' });

	try {
		const approvedPlans = await cacheDb.get('hub:v1:plans:approved:json');
		if (!approvedPlans) throw new Error('No approved plans found in API Cache');

		const activePlanId = JSON.parse(approvedPlans)
			.filter((plan: HubPlan) => plan.is_active && plan.agency_id === CP_AGENCY_ID)
			.at(0)?._id;

		if (!activePlanId) throw new Error(`No active plan found for agency ID: ${CP_AGENCY_ID}`);

		const cpTrips = await externalClients.cp.tripUpdates();
		const cpStopIdCache = new Map<string, null | string>();
		const cpByStopUpdates = new Map<string, GtfsRtTripUpdate[]>();
		let cpTripUpdateCount = 0;

		for (const entity of cpTrips.entity ?? []) {
			const tripUpdate = entity.trip_update;
			const cpTripId = tripUpdate?.trip?.trip_id;
			if (!tripUpdate || !cpTripId) continue;

			const publicTripId = getPublicTripId(activePlanId, CP_AGENCY_ID, cpTripId);
			const stopTimeUpdates = [];

			for (const stopTimeUpdate of tripUpdate.stop_time_update ?? []) {
				if (!stopTimeUpdate.stop_id) continue;

				let internalStopId = cpStopIdCache.get(stopTimeUpdate.stop_id);
				if (internalStopId === undefined) {
					const foundStop = await goDb.infrastructure.stops.findOne(
						{ 'flags.stop_id': stopTimeUpdate.stop_id },
						{ projection: { _id: 1 } },
					);
					internalStopId = foundStop ? String(foundStop._id) : null;
					cpStopIdCache.set(stopTimeUpdate.stop_id, internalStopId);
				}

				if (!internalStopId) {
					Logger.error({ message: `CP stop ID ${stopTimeUpdate.stop_id} not found.` });
					continue;
				}

				stopTimeUpdates.push({ ...stopTimeUpdate, stop_id: internalStopId });
			}

			if (!stopTimeUpdates.length) continue;

			const transformedTripUpdate: GtfsRtTripUpdate = {
				...tripUpdate,
				stop_time_update: stopTimeUpdates,
				trip: { ...tripUpdate.trip, trip_id: publicTripId },
			};

			feedResult.entity.push({ id: publicTripId, trip_update: transformedTripUpdate });
			await cacheDb.set(`hub:v1:realtime:eta:by-trip:${publicTripId}:gtfs`, JSON.stringify(transformedTripUpdate));

			console.log('TRANSFORMED TRIP UPDATE', JSON.stringify(transformedTripUpdate, null, 2));

			for (const stopTimeUpdate of stopTimeUpdates) {
				const perStopTripUpdate: GtfsRtTripUpdate = {
					...transformedTripUpdate,
					stop_time_update: [stopTimeUpdate],
				};
				const stopTripUpdates = cpByStopUpdates.get(stopTimeUpdate.stop_id) ?? [];
				stopTripUpdates.push(perStopTripUpdate);
				cpByStopUpdates.set(stopTimeUpdate.stop_id, stopTripUpdates);
			}

			cpTripUpdateCount++;
		}

		await Promise.all([...cpByStopUpdates.entries()].map(async ([stopId, cpTripUpdates]) => {
			const existing = await cacheDb.get(`hub:v1:realtime:eta:by-stop:${stopId}:gtfs`);
			const tripUpdates: GtfsRtTripUpdate[] = existing ? JSON.parse(existing) : [];

			for (const cpTripUpdate of cpTripUpdates) {
				const index = tripUpdates.findIndex(tu => tu.trip.trip_id === cpTripUpdate.trip.trip_id);
				if (index >= 0) tripUpdates[index] = cpTripUpdate;
				else tripUpdates.push(cpTripUpdate);
			}

			await cacheDb.set(`hub:v1:realtime:eta:by-stop:${stopId}:gtfs`, JSON.stringify(tripUpdates));
		}));

		Logger.info({ message: `Found ${cpTripUpdateCount} CP trip updates in ${cpTimer.get()}`, spacesAfterOrBefore: 1 });
	} catch (error) {
		Logger.error({ error, message: `Failed to publish CP trip updates in ${cpTimer.get()}` });
	}

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
