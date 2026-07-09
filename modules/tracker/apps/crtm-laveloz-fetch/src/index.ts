/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent, type RawVehicleEventCrtmLaVelozV1 } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

/* * */

let ITERATION = 0;

/* * */

const main = async () => {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'crtm-laveloz-fetch', message: 'Sentry Tracker CRTM La Veloz Fetch initialized', module: 'tracker', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker CRTM La Veloz Fetch' });
	}

	//
	// Initialize the timer

	const timer = new Timer();

	let saveCount = 0;

	//
	// Fetch the CRTM La Veloz Vehicle Events data from the API and decode it

	Logger.info({ message: `[${ITERATION}] Fetching CRTM La Veloz data from API...`, spacesAfterOrBefore: 1, spacesBefore: 0 });

	const decodedMessage = await externalClients.crtmLaVeloz.vehiclePositions();

	Logger.info({ message: `[${ITERATION}] Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the CRTM La Veloz data.` });

	//
	// Transform each message into a RawVehicleEvent

	for (const entity of decodedMessage.entity ?? []) {
		try {
		//

			//
			// Skip entities that do not have a vehicle field,
			// as they are not relevant for our use case.

			if (!entity.vehicle) continue;

			if (!entity.vehicle?.trip?.trip_id) continue;

			//
			// Hash the relevant fields of the vehicle event
			// to create a unique identifier for the event.
			// This allows us to identify duplicate events
			// and avoid storing them multiple times in the database.

			const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventCrtmLaVelozV1> = {
				agency_id: 'crtm-laveloz',
				created_at: Dates.fromSeconds(Number(entity.vehicle.timestamp)).unix_timestamp,
				entity_id: entity.id,
				payload: {
					header: decodedMessage.header,
					vehicle: entity.vehicle,
				},
				version: 'crtm-laveloz-v1',
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

		//
		} catch (error) {
			Logger.error({ error, message: `[${ITERATION}] Error processing vehicle event entity with ID ${entity.id}:` });
		}
	}

	Logger.info({ message: `[${ITERATION}] Saved ${saveCount} new Vehicle Events from CRTM La Veloz data in ${timer.get()}.` });

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: '5s', throwOnError: false });
