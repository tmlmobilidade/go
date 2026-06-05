/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { TrainsResponse } from '@tmlmobilidade/external/dist/clients/fertagus/types.js';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent, RawVehicleEventFertagusV1, Ride } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

/* * */

let ITERATION = 0;

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

	const ridesMap = new Map<string, Ride>();

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
				const foundRides = await rides.findMany({ agency_id: '15', start_time_scheduled: Dates.fromISO(event.startsAt).unix_timestamp });

				//
				// If no ride is found, skip this event.
				if (foundRides.length === 0) {
					Logger.error(`[${ITERATION}] No ride found for event start time scheduled: ${Dates.fromISO(event.startsAt).unix_timestamp} - ${event.stop_id_start} -> ${event.stop_id_end}.`);
					continue;
				}

				// If multiple rides are found, skip this event.
				// This can be improved by checking start and end stop IDs.
				if (foundRides.length > 1) {
					Logger.error(`[${ITERATION}] Multiple rides found for event ${event.date} ${event.train_id} ${event.stop_id_start} ${event.stop_id_end} ${event.startsAt}.`);
					continue;
				}

				ridesMap.set(rideKey, foundRides[0]);
			} catch (error) {
				Logger.error(`[${ITERATION}] Error finding rides for event ${event.date} ${event.train_id} ${event.stop_id_start} ${event.stop_id_end} ${event.startsAt}:`, error);
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
