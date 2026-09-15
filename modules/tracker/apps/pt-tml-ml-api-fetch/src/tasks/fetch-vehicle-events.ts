/* * */

import { externalClients } from '@tmlmobilidade/external';
import { type BaseResponse, type TempoEsperaRawItem } from '@tmlmobilidade/external/dist/clients/ml/types.js';
import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { hashRawVehicleEvent } from '@tmlmobilidade/go-tracker-pckg-shared';
import { type HashableRawVehicleEvent, type RawVehicleEventPtTmlMlV1 } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger } from '@tmlmobilidade/logger';

import { type AggregationResult, ML_AGENCY_ID, type TrainPositionsMap } from '../types.js';
import { findRideForTrain } from '../utils/find-ride-for-train.js';
import { findTripStopWaypoints } from '../utils/find-trip-stop-waypoints.js';
import { groupTrainPositions } from '../utils/group-train-positions.js';
import { inferTrainPositionOnShape } from '../utils/infer-train-position.js';

/* * */

const LINES = ['Amarela', 'Azul', 'Verde', 'Vermelha'];

/* * */

/**
 * Fetches the Metro Lisboa waiting times per line, infers each train's position
 * on its matched Ride shape and writes the resulting Vehicle Events
 * not yet stored to the RawVehicleEvents collection.
 * @param iteration The current run number, used to tag log messages
 * @returns The number of new Vehicle Events saved
 */
export async function fetchVehicleEvents(iteration: number): Promise<number> {
	//

	const now = Dates.now('Europe/Lisbon');

	let saveCount = 0;

	//
	// Initialize the train positions map.
	// This groups the upcoming trains per line so we can infer where each one is.

	const trainPositionsMap: TrainPositionsMap = new Map();

	//
	// Fetch the Metro Lisboa Vehicle Events data from API and decode it.

	Logger.info({ message: `[${iteration}] Fetching Metro Lisboa data from API...`, spacesAfterOrBefore: 1, spacesBefore: 0 });

	for (const line of LINES) {
		//

		//
		// Reset the per-line train grouping map.

		trainPositionsMap.clear();

		//
		// Fetch the waiting times for this line.
		// On error, log and continue to the next line.

		let response: BaseResponse<TempoEsperaRawItem[]> | null;
		try {
			response = await externalClients.ml.tempoEsperaLinha(line);
		} catch (error) {
			Logger.error({ error, message: `[${iteration}] Error fetching Metro Lisboa data from API for line ${line}:` });
			continue;
		}

		groupTrainPositions({ items: response.resposta, trainPositionsMap });

		//
		// For each train, infer its current position.

		for (const [trainId, { destination_id: destinationId, next_stop: nextStop }] of trainPositionsMap) {
			//

			//
			// Match a Metro Lisboa ride based on the inferred destination and the current reference time.
			// If no corresponding ride is found for the current train, skip to the next train.
			// Any error while searching is logged, and the loop continues.

			let ride: AggregationResult | null;
			try {
				ride = await findRideForTrain({ destinationId, now });
			} catch (error) {
				Logger.error({ error, message: `[${iteration}] Error finding ride for train ${trainId} on line ${line}:` });
				continue;
			}

			if (!ride) continue;

			//
			// Given the next stop (from the API) and the matched ride, extract the waypoints in the ride's shape:
			// - nextStopWaypoint: the shape point nearest to the next stop.
			// - previousStopWaypoint: the shape point immediately preceding it (used to interpolate the train position).

			const { nextStopWaypoint, previousStopWaypoint } = findTripStopWaypoints({ nextStop, ride });

			if (!nextStopWaypoint) continue;

			//
			// Infer the train's current position as a point [longitude, latitude] on the ride's shape.

			const pointInChunkedLine = inferTrainPositionOnShape({ nextStop, nextStopWaypoint, previousStopWaypoint, ride });

			//
			// Hash the relevant fields of the vehicle event
			// to create a unique identifier for the event.
			// This allows us to identify duplicate events
			// and avoid storing them multiple times in the database.

			const hashableRawEvent: HashableRawVehicleEvent<RawVehicleEventPtTmlMlV1> = {
				agency_id: ML_AGENCY_ID,
				created_at: now.unix_milliseconds,
				entity_id: `${line}_${trainId}_${destinationId}`,
				payload: {
					header: {
						gtfs_realtime_version: '2.0',
						incrementality: 'FULL_DATASET',
						timestamp: now.unix_milliseconds,
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
						timestamp: now.unix_milliseconds,
						trip: {
							trip_id: ride.trip_id,
						},
						vehicle: {
							id: trainId,
						},
					},
				},
				version: 'pt-tml-ml-v1',
			};

			const hashableRawEventId = hashRawVehicleEvent(hashableRawEvent);

			//
			// Write the new vehicle event document
			// to the RawVehicleEvents collection.

			const alreadyExists = await rawDb.vehicleEvents.ptTmlMl.findOne({ _id: hashableRawEventId });

			if (alreadyExists) continue;

			await rawDb.vehicleEvents.ptTmlMl.insertOne({
				...hashableRawEvent,
				_id: hashableRawEventId,
				received_at: Dates.now('Europe/Lisbon').unix_milliseconds,
			});

			saveCount++;
		}
	}

	return saveCount;

	//
}
