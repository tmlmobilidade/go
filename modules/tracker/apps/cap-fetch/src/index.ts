/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent, type RawVehicleEventCapV1 } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

/* * */

const API_URL = 'https://cascais-rt.trenmo.com/api/v1/key/fcba5b10/agency/2/command/gtfs-rt/vehiclePositions';

/* * */

let ITERATION = 0;

/* * */

const main = async () => {
	//

	const timer = new Timer();

	let saveCount = 0;

	//
	// Fetch the CAP Vehicle Events data from the API and decode it

	Logger.info(`[${ITERATION}] Fetching CAP data from API...`, 0, 1);

	const response = await fetch(API_URL, {
		headers: {
			Authorization: `Basic ${Buffer.from(`${process.env.CAP_API_USERNAME}:${process.env.CAP_API_PASSWORD}`).toString('base64')}`,
		},
	});
	const arrayBuffer = await response.arrayBuffer();
	const decodedMessage = await decodeGtfsRtFeed(arrayBuffer);

	Logger.info(`[${ITERATION}] Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the CAP data.`);

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

		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventCapV1> = {
			agency_id: '21',
			created_at: Dates.fromSeconds(Number(entity.vehicle.timestamp)).unix_timestamp,
			entity_id: entity.id,
			payload: {
				header: decodedMessage.header,
				vehicle: entity.vehicle,

			},
			version: 'cap-v1',
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
	}

	Logger.info(`[${ITERATION}] Saved ${saveCount} new Vehicle Events from CAP data in ${timer.get()}.`);

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30s' });
