import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent, type RawVehicleEventCpV1 } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

import { refreshToken, shouldRefreshToken, type TokenResponse } from './fetch-token.js';
import { openTunnel } from './tunnel.js';

/* * */

const API_URL = 'https://api-gateway.cp.pt/cp/partner/gtfs-partners/realtime/VehiclePositions.pb';

/* * */

let ITERATION = 0;
let API_TOKEN: TokenResponse | undefined = undefined;

/* * */

const main = async () => {
	//

	const timer = new Timer();
	let saveCount = 0;

	//
	// Open SSH tunnel for CP auth and refresh token when needed.

	const tunnelPort = await openTunnel();

	//
	// Fetch the CP Vehicle Events data from API and decode it.

	Logger.info(`[${ITERATION}] Fetching CP data from API...`, 0, 1);

	if (shouldRefreshToken(API_TOKEN)) API_TOKEN = await refreshToken(tunnelPort);

	//
	// Fetch the CP Vehicle Events data from API and decode it.

	const response = await fetch(API_URL, {
		headers: {
			'Authorization': `Bearer ${API_TOKEN.access_token}`,
			'x-cp-connect-id': process.env.CP_API_KEY || '',
			'x-cp-connect-secret': process.env.CP_API_SECRET || '',
		},
	});

	const arrayBuffer = await response.arrayBuffer();
	const decodedMessage = await decodeGtfsRtFeed(arrayBuffer);

	Logger.info(`[${ITERATION}] Found ${decodedMessage.entity?.length ?? 0} Vehicle Events in the CP data.`);

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
		// Hash the relevant fields of the vehicle event
		// to create a unique identifier for the event.
		// This allows us to identify duplicate events
		// and avoid storing them multiple times in the database
		const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventCpV1> = {
			agency_id: '3',
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
			version: 'cp-v1',
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

	Logger.info(`[${ITERATION}] Saved ${saveCount} new Vehicle Events from CP data in ${timer.get()}.`);

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: '30s', throwOnError: true });
