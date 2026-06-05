/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { TrainsResponse } from '@tmlmobilidade/external/dist/clients/fertagus/types.js';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent, HashedPattern, RawVehicleEventFertagusV1, Ride } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

/* * */

let ITERATION = 0;

interface FoundRideDocument {
	_id: Ride['_id']
	agency_id: Ride['agency_id']
	first_stop_id: string
	last_stop_id: string
	line_id: HashedPattern['line_id']
	line_long_name: HashedPattern['line_long_name']
	line_short_name: HashedPattern['line_short_name']
	pattern_id: HashedPattern['pattern_id']
	route_color: HashedPattern['route_color']
	route_id: HashedPattern['route_id']
	route_long_name: HashedPattern['route_long_name']
	route_short_name: HashedPattern['route_short_name']
	route_text_color: HashedPattern['route_text_color']
	trip_headsign: HashedPattern['trip_headsign']
	trip_id: Ride['trip_id']

}

/* * */

const main = async () => {
	//

	const timer = new Timer();
	let saveCount = 0;

	//
	// Fetch the Fertagus Vehicle Events data from API and decode it.

	Logger.info(`[${ITERATION}] Fetching Fertagus data from API...`, 0, 1);

	let response: null | TrainsResponse = null;
	try {
		response = await externalClients.fertagus.trains();
	} catch (error) {
		Logger.error(`[${ITERATION}] Error fetching Fertagus data from API:`, error);
		return;
	}

	Logger.info(`[${ITERATION}] Found ${response.length ?? 0} Vehicle Events in the Fertagus data.`);

	const ridesMap = new Map<string, FoundRideDocument>();

	for (const event of response ?? []) {
		//

		//
		// Skip events that do not have a date, latitude, longitude, startsAt, stop_id_end, stop_id_start, or train_id.
		if (!event.date || !event.latitude || !event.longitude || !event.startsAt || !event.stop_id_end || !event.stop_id_start || !event.train_id) continue;

		//
		// Find the ride of this event.
		const rideKey = `${event.stop_id_start}-${event.stop_id_end}-${event.startsAt}`;

		if (!ridesMap.has(rideKey)) {
			try {
				const ridesCollection = await rides.getCollection();
				const foundRides = await ridesCollection.aggregate<FoundRideDocument>([
					{
						$match: {
							agency_id: '15',
							start_time_scheduled: Dates.fromISO(event.startsAt).unix_timestamp,
						},
					},
					{
						$lookup: {
							as: 'hashed_pattern',
							foreignField: '_id',
							from: 'hashed_patterns',
							localField: 'hashed_pattern_id',
						},
					},
					{
						$unwind: '$hashed_pattern',
					},
					{
						$project: {
							_id: 1,
							agency_id: 1,
							first_stop_id: {
								$first: '$hashed_pattern.path.stop_id',
							},

							last_stop_id: {
								$last: '$hashed_pattern.path.stop_id',
							},
							line_id: '$hashed_pattern.line_id',
							line_long_name: '$hashed_pattern.line_long_name',
							line_short_name: '$hashed_pattern.line_short_name',
							pattern_id: '$hashed_pattern.pattern_id',
							route_color: '$hashed_pattern.route_color',
							route_id: '$hashed_pattern.route_id',
							route_long_name: '$hashed_pattern.route_long_name',
							route_short_name: '$hashed_pattern.route_short_name',
							route_text_color: '$hashed_pattern.route_text_color',

							trip_headsign: '$hashed_pattern.trip_headsign',
							trip_id: 1,
						},
					},
					{
						$match: {
							first_stop_id: event.stop_id_start,
							last_stop_id: event.stop_id_end,
						},
					},
				]).toArray();

				//
				// If no ride is found, skip this event.
				if (foundRides.length === 0) {
					Logger.error(`[${ITERATION}] No ride found for event start time scheduled: ${Dates.fromISO(event.startsAt).unix_timestamp} - ${event.stop_id_start} -> ${event.stop_id_end}.`);
					continue;
				}

				// If multiple rides are found, skip this event.
				// This can be improved by checking start and end stop IDs.
				if (foundRides.length > 1) {
					Logger.error(`[${ITERATION}] Multiple rides found for event start time scheduled: ${Dates.fromISO(event.startsAt).unix_timestamp} - ${event.stop_id_start} -> ${event.stop_id_end}.`);
					continue;
				}

				ridesMap.set(rideKey, foundRides[0]);
			} catch (error) {
				Logger.error(`[${ITERATION}] Error finding rides for event start time scheduled: ${Dates.fromISO(event.startsAt).unix_timestamp} - ${event.stop_id_start} -> ${event.stop_id_end}:`, error);
				continue;
			}
		}

		const eventRide = ridesMap.get(rideKey);
		if (!eventRide) continue;

		//
		// Add the ride to the map.
		ridesMap.set(`${event.stop_id_start}-${event.stop_id_end}-${event.startsAt}`, eventRide);

		//
		// Hash the relevant fields of the vehicle event
		// to create a unique identifier for the event.
		// This allows us to identify duplicate events
		// and avoid storing them multiple times in the database
		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventFertagusV1> = {
			agency_id: '15',
			created_at: Dates.fromISO(event.date).unix_timestamp,
			entity_id: Buffer.from(`15-${event.date}-${event.train_id}`).toString('base64').replace(/=+$/, ''),
			payload: {
				header: {
					gtfs_realtime_version: '2.0',
					incrementality: 'FULL_DATASET',
					timestamp: Dates.fromISO(event.date).unix_timestamp,
				},
				vehicle: {
					agencyId: '15',
					current_status: 'IN_TRANSIT_TO',
					position: {
						latitude: event.latitude,
						longitude: event.longitude,
					},
					timestamp: Dates.fromISO(event.date).unix_timestamp,
					trip: {
						line_id: eventRide.line_id.toString(),
						pattern_id: eventRide.pattern_id,
						route_id: eventRide.route_id,
						schedule_relationship: 'SCHEDULED',
						trip_id: eventRide.trip_id,
					},
					vehicle: {
						id: event.train_id.toString(),
					},
				},
			},
			version: 'fertagus-v1',
		};

		const hashableRawEventId = crypto
			.createHash('sha256')
			.update(JSON.stringify(hashableRawEvent))
			.digest('hex');

		//
		// Write the new vehicle event document
		// to the RawVehicleEvents collection

		const alreadyExists = await rawVehicleEventsNew.findOne({ _id: hashableRawEventId });

		if (alreadyExists) continue;

		await rawVehicleEventsNew.insertOne({
			...hashableRawEvent,
			_id: hashableRawEventId,
			received_at: Dates.now('Europe/Lisbon').unix_timestamp,
		});

		saveCount++;
	}

	Logger.info(`[${ITERATION}] Saved ${saveCount} new Vehicle Events from Fertagus data in ${timer.get()}.`);

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: '5s', throwOnError: true });
