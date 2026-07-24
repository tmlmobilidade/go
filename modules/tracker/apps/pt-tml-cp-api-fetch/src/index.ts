/* * */

import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { type HashableRawVehicleEvent, type RawVehicleEventPtTmlCpV1 } from '@tmlmobilidade/go-types-vehicle-events';
import { initSentry, Logger } from '@tmlmobilidade/logger-logger-backend';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

/* * */

let ITERATION = 0;

/* * */
try {
	await initSentry();
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Tracker CP Fetch' });
}

const main = async () => {
	//

	//
	// Initialize the timer

	const timer = new Timer();
	let saveCount = 0;

	//
	// Fetch the CP Vehicle Events data from API and decode it.

	Logger.info({ message: `[${ITERATION}] Fetching CP data from API...`, spacesAfterOrBefore: 1, spacesBefore: 0 });

	const decodedMessage = await externalClients.cp.vehiclePositions();

	Logger.info({ message: `[${ITERATION}] Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the CP data.` });

	//
	// Transform each message into RawVehicleEvent and persist new ones.

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
		// Skip entities that do not have a position field,
		// as they are not relevant for our use case.

		if (!entity.vehicle.position) continue;

		//
		// Hash the relevant fields of the vehicle event
		// to create a unique identifier for the event.
		// This allows us to identify duplicate events
		// and avoid storing them multiple times in the database
		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventPtTmlCpV1> = {
			agency_id: 'N18KL',
			created_at: Dates.fromSeconds(Number(entity.vehicle.timestamp)).unix_timestamp,
			entity_id: entity.id,
			payload: {
				header: decodedMessage.header,
				vehicle: {
					...entity.vehicle,
					vehicle: {
						id: entity.id,
					},
				},
			},
			version: 'pt-tml-cp-v1',
		};

		const hashableRawEventId = crypto
			.createHash('sha256')
			.update(JSON.stringify(hashableRawEvent))
			.digest('hex');

		//
		// Write the new vehicle event document
		// to the RawVehicleEvents collection

		const alreadyExists = await rawDb.vehicleEvents.ptTmlCp.findOne({ _id: hashableRawEventId });

		if (alreadyExists) continue;

		await rawDb.vehicleEvents.ptTmlCp.insertOne({
			...hashableRawEvent,
			_id: hashableRawEventId,
			received_at: Dates.now('Europe/Lisbon').unix_timestamp,
		});

		saveCount++;
	}

	Logger.info({ message: `[${ITERATION}] Saved ${saveCount} new Vehicle Events from CP data in ${timer.get()}.` });

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: '5s', throwOnError: true });
