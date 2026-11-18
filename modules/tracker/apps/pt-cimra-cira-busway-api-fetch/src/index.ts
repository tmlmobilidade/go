/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { type HashableRawVehicleEvent, type RawVehicleEventPtCimraCiraBuswayV1 } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import crypto from 'node:crypto';

/* * */

let ITERATION = 0;

/* * */

const main = async () => {
	//

	//
	// Initialize the timer

	const timer = new Timer();

	let saveCount = 0;

	//
	// Fetch the CIRA Busway Vehicle Events data from the API and decode it

	Logger.info({ message: `[${ITERATION}] Fetching CIRA Busway data from API...`, spacesAfter: 1, spacesBefore: 0 });

	if (!process.env.PT_CIRA_VEHICLE_EVENTS_URL) throw new Error('Missing PT_CIRA_VEHICLE_EVENTS_URL environment variable.');

	const response = await fetch(process.env.PT_CIRA_VEHICLE_EVENTS_URL);
	if (!response.ok) throw new Error(`CIRA Busway feed request failed: ${response.status} ${response.statusText}`);
	const decodedMessage = await decodeGtfsRtFeed(await response.arrayBuffer());

	Logger.info({ message: `[${ITERATION}] Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the CIRA Busway data.` });

	//
	// Transform each message into a RawVehicleEvent

	for (const entity of decodedMessage.entity ?? []) {
		try {
		//

			//
			// Skip entities that do not have a vehicle field,
			// as they are not relevant for our use case.

			if (!entity.vehicle) continue;

			if (!entity.vehicle.position || !entity.vehicle.vehicle?.id || !entity.vehicle.trip?.trip_id) continue;

			const timestamp = Number(entity.vehicle.timestamp ?? decodedMessage.header.timestamp);
			if (!Number.isFinite(timestamp) || timestamp <= 0) continue;

			//
			// Hash the relevant fields of the vehicle event
			// to create a unique identifier for the event.
			// This allows us to identify duplicate events
			// and avoid storing them multiple times in the database.

			const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventPtCimraCiraBuswayV1> = {
				agency_id: '6QI7P',
				created_at: Dates.fromSeconds(timestamp).unix_milliseconds,
				entity_id: entity.id,
				payload: {
					header: decodedMessage.header,
					vehicle: entity.vehicle,
				},
				version: 'pt-cimra-cira-busway-v1',
			};

			const hashableRawEventId = crypto
				.createHash('sha256')
				.update(JSON.stringify({
					agency_id: hashableRawEvent.agency_id,
					created_at: hashableRawEvent.created_at,
					entity_id: hashableRawEvent.entity_id,
					vehicle: entity.vehicle,
				}))
				.digest('hex');

			//
			// Write the new vehicle event document
			// to the RawVehicleEvents collection

			const alreadyExists = await rawDb.vehicleEvents.ptCimraCiraBusway.findOne({ _id: hashableRawEventId });

			if (alreadyExists) continue;

			await rawDb.vehicleEvents.ptCimraCiraBusway.insertOne({
				...hashableRawEvent,
				_id: hashableRawEventId,
				received_at: Dates.now('Europe/Lisbon').unix_milliseconds,
			});

			saveCount++;

		//
		} catch (error) {
			Logger.error({ error, message: `[${ITERATION}] Error processing vehicle event entity with ID ${entity.id}:` });
		}
	}

	Logger.info({ message: `[${ITERATION}] Saved ${saveCount} new Vehicle Events from CIRA Busway data in ${timer.get()}.` });

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: '10s', throwOnError: false });
