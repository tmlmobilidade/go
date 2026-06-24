/* * */

import { rawVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { externalClients } from '@tmlmobilidade/external';
import { BaseResponse, DESTINATION_MAP, TempoEsperaRawItem } from '@tmlmobilidade/external/dist/clients/ml/types.js';
import { chunkLineByDistanceV2, hashedShapesToFeatureCollection, lineSlice, nearestPointOnLine, point } from '@tmlmobilidade/geo';
import { rides, stops } from '@tmlmobilidade/interfaces';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashableRawVehicleEvent, type RawVehicleEventMlV1 } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import { Feature, LineString, Point } from 'geojson';
import crypto from 'node:crypto';

import { aggregationQuery } from './aggregation-query.js';
import { AggregationResult, TripStopWaypoint } from './types.js';

/* * */

let ITERATION = 0;

const gtfsTimeToSeconds = (time: string): number => {
	const [hours, minutes, seconds] = time.split(':').map(Number);
	return hours * 3600 + minutes * 60 + seconds;
};

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

	const trainPositionsMap = new Map<string, { destination_id: string, next_stop: { arrival_seconds: number, stop_id: string } }>();

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

		//
		// Group the response by train.
		// Each platform item reports up to 3 upcoming trains with their arrival times.

		for (const item of response.resposta) {
			//

			//
			// Skip invalid data.

			if (!item.comboio || item.tempoChegada1 === '--') continue;

			//
			// Parse the data.

			const trainId = item.comboio;
			const destinationId = DESTINATION_MAP[item.destino as unknown as keyof typeof DESTINATION_MAP]?.code;
			const arrivalSeconds = Number.parseInt(item.tempoChegada1);
			const stopId = item.stop_id;

			//
			// If there is no entry for this train, create one.
			if (!trainPositionsMap.has(trainId)) {
				trainPositionsMap.set(trainId, { destination_id: destinationId, next_stop: { arrival_seconds: arrivalSeconds, stop_id: stopId } });
			}

			//
			// If the new arrival time is earlier than the current one, update the entry, as we only care about the earliest arrival time.
			if (arrivalSeconds < trainPositionsMap.get(trainId).next_stop.arrival_seconds) {
				trainPositionsMap.get(trainId).next_stop = { arrival_seconds: arrivalSeconds, stop_id: stopId };
			}
		}

		//
		// For each train, infer its current position.

		for (const [trainId, { destination_id: destinationId, next_stop: nextStop }] of trainPositionsMap) {
			//

			//
			// Finds a single HashedTrip for this train with the destionation stop name as the trip headsign.
			// The trip is enriched with the stop codes for each waypoint in the path.
			// This will be used to understand the time difference between the previous and the trains `next_stop`.

			let ride: AggregationResult | null = null;
			try {
				// Find the GTFS stop document for the train's destination
				const destinationStop = await stops.findOne({
					flags: { $elemMatch: { agency_ids: '2', stop_id: destinationId } },
				});

				if (!destinationStop) continue;

				// Fetch hashed trip patterns matching this trip's headsign and arrival window
				const ridesCollection = await rides.getCollection();

				const ridesAggregationResult = await ridesCollection.aggregate(
					aggregationQuery({
						endTimeScheduled: now.plus({ hours: 2 }).unix_timestamp,
						headsign: destinationStop.name,
						startTimeScheduled: now.minus({ hours: 2 }).unix_timestamp,
					}),
				).toArray() as AggregationResult[];

				if (ridesAggregationResult.length === 0) continue;
				// Use the first match (should only be one due to unique pattern).
				ride = ridesAggregationResult[0];
			} catch (error) {
				Logger.error({ error, message: `[${ITERATION}] Error finding hashed trip for train ${trainId} on line ${line}:` });
				console.log(error);
				continue;
			}

			//
			// Find the next stop's waypoint in the hashed trip path.

			let previousStopWaypoint: TripStopWaypoint | undefined = undefined;
			let nextStopWaypoint: TripStopWaypoint | undefined = undefined;
			for (const [index, waypoint] of ride.hashed_trip.path.entries()) {
				const foundStopCode = waypoint.stop_codes.find(code => code === nextStop.stop_id);
				if (!foundStopCode) continue;

				if (index > 0) {
					const timeDifference = gtfsTimeToSeconds(waypoint.arrival_time) - gtfsTimeToSeconds(ride.hashed_trip.path[index - 1].departure_time);

					previousStopWaypoint = {
						latitude: ride.hashed_trip.path[index - 1].stop_lat,
						longitude: ride.hashed_trip.path[index - 1].stop_lon,
						stop_id: ride.hashed_trip.path[index - 1].stop_id,
						timeDifference,
					};

					nextStopWaypoint = {
						latitude: waypoint.stop_lat,
						longitude: waypoint.stop_lon,
						stop_id: waypoint.stop_id,
						timeDifference,
					};
				} else {
					nextStopWaypoint = {
						latitude: waypoint.stop_lat,
						longitude: waypoint.stop_lon,
						stop_id: waypoint.stop_id,
						timeDifference: 0,
					};
				}

				break;
			}

			if (!nextStopWaypoint) continue;

			//
			// Infer position along the shape. When the next stop is the first in the trip,
			// there is no previous stop to interpolate from — place the train at that stop.

			let pointInChunkedLine: [number, number];

			if (!previousStopWaypoint) {
				pointInChunkedLine = [nextStopWaypoint.longitude, nextStopWaypoint.latitude];
			} else {
				//
				// Convert HashedShape to GeoJSON
				const hashedShapeLineString: Feature<LineString> = hashedShapesToFeatureCollection(ride.hashed_shape).features[0];
				const previousStopPoint: Feature<Point> = point([previousStopWaypoint.longitude, previousStopWaypoint.latitude]);
				const nextStopPoint: Feature<Point> = point([nextStopWaypoint.longitude, nextStopWaypoint.latitude]);

				const nearestPreviousStopPointOnShape = nearestPointOnLine(hashedShapeLineString, previousStopPoint);
				const nearestNextStopPointOnShape = nearestPointOnLine(hashedShapeLineString, nextStopPoint);

				// Subsection of shape between the two nearest points
				const slicedShape = lineSlice(nearestPreviousStopPointOnShape, nearestNextStopPointOnShape, hashedShapeLineString);
				const chuckedLine = chunkLineByDistanceV2(slicedShape.geometry, 25);

				if (chuckedLine.coordinates.length === 0 || nextStopWaypoint.timeDifference <= 0) {
					pointInChunkedLine = [
						(previousStopWaypoint.longitude + nextStopWaypoint.longitude) / 2,
						(previousStopWaypoint.latitude + nextStopWaypoint.latitude) / 2,
					];
				} else {
					// Given the time difference between the previous and the next stop,
					// And the next_stop: arrival_seconds we can calculate the percentage of the chunked line that the vehicle has traveled.
					// Eg. If ETA is 30s (nextStop.arrival_seconds) and delta between stops (nextStopWaypoint.timeDifference) is 120s
					// This means the vehicle has traveled 75% of the distance between the two stops, and it's missing the last 25%.
					// ((nextStopWaypoint.timeDifference - nextStop.arrival_seconds))/nextStopWaypoint.timeDifference = percentage of the chunked line that the vehicle has traveled.

					const timeDifferenceBetweenPreviousAndNextStop = nextStopWaypoint.timeDifference - nextStop.arrival_seconds;
					let percentageOfChunkedLine = timeDifferenceBetweenPreviousAndNextStop / nextStopWaypoint.timeDifference;

					//
					// If for some reason the percentage is lower than 0%, means that the vehicle is delayed
					// Here we'll set the percentage to 0.5, which means that the vehicle is halfway between the two stops.
					// (We're not sure if this is correct, but it's a guess)

					if (percentageOfChunkedLine < 0) percentageOfChunkedLine = 0.5;

					const coordinateIndex = Math.min(
						Math.max(0, Math.floor(percentageOfChunkedLine * (chuckedLine.coordinates.length - 1))),
						chuckedLine.coordinates.length - 1,
					);

					pointInChunkedLine = chuckedLine.coordinates[coordinateIndex] as [number, number];
				}
			}

			if (!pointInChunkedLine) continue;

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
