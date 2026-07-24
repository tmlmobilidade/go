/* * */

import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { type HashableRawVehicleEvent, type RawVehicleEventPtTmlMobiV1 } from '@tmlmobilidade/go-types-vehicle-events';
import { initSentry, Logger } from '@tmlmobilidade/logger-logger-backend';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

/* * */

let ITERATION = 0;

/* * */

const main = async () => {
	//

	// Initialize Sentry

	try {
		await initSentry();
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker MOBI Fetch' });
	}

	//
	// Initialize the timer

	const timer = new Timer();

	let saveCount = 0;

	//
	// Fetch the MOBI Vehicle Events data from the API and decode it

	Logger.info({ message: `[${ITERATION}] Fetching MOBI data from API...`, spacesAfterOrBefore: 1, spacesBefore: 0 });

	const decodedMessage = await externalClients.mobi.vehiclePositions();

	Logger.info({ message: `[${ITERATION}] Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the MOBI data.` });

	//
	// Transform each message into a RawVehicleEvent

	for (const entity of decodedMessage.entity ?? []) {
		//

		//
		// Skip entities that do not have a vehicle field,
		// as they are not relevant for our use case.

		if (!entity.vehicle) continue;

		//
		// Skip entities that do not have a trip field,
		// as they are not relevant for our use case.

		if (!entity.vehicle.trip) continue;

		//
		// Hash the relevant fields of the vehicle event
		// to create a unique identifier for the event.
		// This allows us to identify duplicate events
		// and avoid storing them multiple times in the database.

		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventPtTmlMobiV1> = {
			agency_id: 'HF16N',
			created_at: Dates.fromSeconds(Number(entity.vehicle.timestamp)).unix_timestamp,
			entity_id: entity.id,
			payload: {
				header: decodedMessage.header,
				vehicle: entity.vehicle,

			},
			version: 'pt-tml-mobi-v1',
		};

		const hashableRawEventId = crypto
			.createHash('sha256')
			.update(JSON.stringify(hashableRawEvent))
			.digest('hex');

		//
		// Write the new vehicle event document
		// to the RawVehicleEvents collection

		const alreadyExists = await rawDb.vehicleEvents.ptTmlMobi.findOne({ _id: hashableRawEventId });

		if (alreadyExists) continue;

		await rawDb.vehicleEvents.ptTmlMobi.insertOne({
			...hashableRawEvent,
			_id: hashableRawEventId,
			received_at: Dates.now('Europe/Lisbon').unix_timestamp,
		});

		saveCount++;

		//
	}

	Logger.info({ message: `[${ITERATION}] Saved ${saveCount} new Vehicle Events from MOBI data in ${timer.get()}.` });

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30s', throwOnError: true });
