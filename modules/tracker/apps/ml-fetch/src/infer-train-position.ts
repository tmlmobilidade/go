/* * */

import { chunkLineByDistanceV2, hashedShapesToFeatureCollection, lineSlice, nearestPointOnLine, point } from '@tmlmobilidade/geo';
import { type Feature, type LineString, type Point } from 'geojson';

import { type AggregationResult, type TrainNextStop, type TripStopWaypoint } from './types.js';

/* * */

interface InferTrainPositionOnShapeParams {
	nextStop: TrainNextStop
	nextStopWaypoint: TripStopWaypoint
	previousStopWaypoint?: TripStopWaypoint
	ride: AggregationResult
}

/**
 * Infers the train's current position along the hashed shape from ETA and inter-stop travel time.
 * When the next stop is the first in the trip, returns that stop's coordinates.
 */
export function inferTrainPositionOnShape({ nextStop, nextStopWaypoint, previousStopWaypoint, ride }: InferTrainPositionOnShapeParams): [number, number] {
	if (!previousStopWaypoint) {
		return [nextStopWaypoint.longitude, nextStopWaypoint.latitude];
	}

	const hashedShapeLineString: Feature<LineString> = hashedShapesToFeatureCollection(ride.hashed_shape).features[0];
	const previousStopPoint: Feature<Point> = point([previousStopWaypoint.longitude, previousStopWaypoint.latitude]);
	const nextStopPoint: Feature<Point> = point([nextStopWaypoint.longitude, nextStopWaypoint.latitude]);

	const nearestPreviousStopPointOnShape = nearestPointOnLine(hashedShapeLineString, previousStopPoint);
	const nearestNextStopPointOnShape = nearestPointOnLine(hashedShapeLineString, nextStopPoint);

	const slicedShape = lineSlice(nearestPreviousStopPointOnShape, nearestNextStopPointOnShape, hashedShapeLineString);
	const chuckedLine = chunkLineByDistanceV2(slicedShape.geometry, 25);

	if (chuckedLine.coordinates.length === 0 || nextStopWaypoint.timeDifference <= 0) {
		return [
			(previousStopWaypoint.longitude + nextStopWaypoint.longitude) / 2,
			(previousStopWaypoint.latitude + nextStopWaypoint.latitude) / 2,
		];
	}

	const timeDifferenceBetweenPreviousAndNextStop = nextStopWaypoint.timeDifference - nextStop.arrival_seconds;
	let percentageOfChunkedLine = timeDifferenceBetweenPreviousAndNextStop / nextStopWaypoint.timeDifference;

	if (percentageOfChunkedLine < 0) percentageOfChunkedLine = 0.5;

	const coordinateIndex = Math.min(
		Math.max(0, Math.floor(percentageOfChunkedLine * (chuckedLine.coordinates.length - 1))),
		chuckedLine.coordinates.length - 1,
	);

	return chuckedLine.coordinates[coordinateIndex] as [number, number];
}
