/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { type BaseResponse, type TempoEsperaRawItem } from '@tmlmobilidade/external/dist/clients/ml/types.js';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent, type RawVehicleEventMlV1 } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import crypto from 'node:crypto';

import { findRideForTrain } from './find-ride-for-train.js';
import { findTripStopWaypoints } from './find-trip-stop-waypoints.js';
import { groupTrainPositions } from './group-train-positions.js';
import { inferTrainPositionOnShape } from './infer-train-position.js';
import { AggregationResult, type TrainPositionsMap } from './types.js';

/* * */

let ITERATION = 0;

/* * */

const main = async () => {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'Metro Lisboa-fetch', message: 'Sentry Tracker Metro Lisboa Fetch initialized', module: 'tracker', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry Tracker Metro Lisboa Fetch' });
	}

	//
	// Initialize the timer

	const now = Dates.now('Europe/Lisbon');
	const timer = new Timer();
	let saveCount = 0;

	//
	// Initialize the train positions map.
	// This groups the upcoming trains per line so we can infer where each one is.

	const trainPositionsMap: TrainPositionsMap = new Map();

	//
	// Fetch the Metro Lisboa Vehicle Events data from API and decode it.

	Logger.info({ message: `[${ITERATION}] Fetching Metro Lisboa data from API...`, spacesAfterOrBefore: 1, spacesBefore: 0 });

	const lines = ['Amarela', 'Azul', 'Verde', 'Vermelha'];

	for (const line of lines) {
		//

		//
		// Reset the per-line train grouping map.

		trainPositionsMap.clear();

		//
		// Fetch the waiting times for this line.
		// On error, log and continue to the next line.

		let response: BaseResponse<TempoEsperaRawItem[]> | null = null;
		try {
			response = await externalClients.ml.tempoEsperaLinha(line);
		} catch (error) {
			Logger.error({ error, message: `[${ITERATION}] Error fetching Metro Lisboa data from API for line ${line}:` });
			continue;
		}

		groupTrainPositions({ items: response.resposta, trainPositionsMap });

		//
		// For each train, infer its current position.

		for (const [trainId, { destination_id: destinationId, next_stop: nextStop }] of trainPositionsMap) {
			//

			/**
			 * For each train, use findRideForTrain to match a Metro Lisboa ride based on the inferred destination (from destinationId)
			 * and the current reference time (now). If no corresponding ride is found for the current train, skip to the next train.
			 * Any error while searching is logged, and the loop continues.
			 */
			let ride: AggregationResult | null = null;
			try {
				ride = await findRideForTrain({ destinationId, now });
			} catch (error) {
				Logger.error({ error, message: `[${ITERATION}] Error finding ride for train ${trainId} on line ${line}:` });
				continue;
			}

			if (!ride) continue;

			// Given the next stop (from the API) and the matched ride document, extract the waypoints in the ride's shape that correspond to:
			// - nextStopWaypoint: The shape point nearest to the nextStop.
			// - previousStopWaypoint: The shape point immediately preceding the nextStop (used to interpolate train position).

			const { nextStopWaypoint, previousStopWaypoint } = findTripStopWaypoints({ nextStop, ride });

			if (!nextStopWaypoint) continue;

			// Infer the train's current position as a point [longitude, latitude] on the ride's shape,
			// using the next stop, corresponding waypoints, and ride details.
			const pointInChunkedLine = inferTrainPositionOnShape({ nextStop, nextStopWaypoint, previousStopWaypoint, ride });

			//
			// Hash the relevant fields of the vehicle event
			// to create a unique identifier for the event.
			// This allows us to identify duplicate events
			// and avoid storing them multiple times in the database.

			const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventMlV1> = {
				agency_id: '2',
				created_at: now.unix_timestamp,
				entity_id: `${line}_${trainId}_${destinationId}`,
				payload: {
					header: {
						gtfs_realtime_version: '2.0',
						incrementality: 'FULL_DATASET',
						timestamp: now.unix_timestamp,
					},
					vehicle: {
						bearing: null,
						current_status: 'IN_TRANSIT_TO',
						position: {
							latitude: pointInChunkedLine[1],
							longitude: pointInChunkedLine[0],
						},
						speed: null,
						stop_id: nextStop.stop_id,
						timestamp: now.unix_timestamp,
						trip: {
							trip_id: `${line}_${trainId}_${destinationId}`,
						},
						vehicle: {
							id: trainId,
						},
					},
				},
				version: 'ml-v1',
			};

			const hashableRawEventId = crypto
				.createHash('sha256')
				.update(JSON.stringify(hashableRawEvent))
				.digest('hex');

			//
			// Write the new vehicle event document
			// to the RawVehicleEvents collection.

			const alreadyExists = await rawVehicleEventsNew.findOne({ _id: hashableRawEventId });

			if (alreadyExists) continue;

			await rawVehicleEventsNew.insertOne({
				...hashableRawEvent,
				_id: hashableRawEventId,
				received_at: Dates.now('Europe/Lisbon').unix_timestamp,
			});

			saveCount++;
		}
	}

	Logger.info({ message: `[${ITERATION}] Saved ${saveCount} new Vehicle Events from Metro Lisboa data in ${timer.get()}.` });

	ITERATION++;

	//
};

/* * */

await runOnInterval(main, { intervalMs: '5s', throwOnError: true });
