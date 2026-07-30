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
 * Infers the train's current position along the line (hashed shape) using estimated time of arrival (ETA)
 * and inter-stop travel times.
 *
 * - If the next stop is the first in the trip (i.e., `previousStopWaypoint` is undefined), returns the coordinates of the next stop.
 * - Otherwise, finds the closest points on the route line geometry (hashed shape) for both the previous and next stops.
 * - Slices the shape between those two points and chunks the segment into ~25-meter intervals.
 * - If chunking fails or there is invalid timing data, returns the midpoint between the previous and next stop locations.
 * - Otherwise, determines the estimated progress as a percentage between the stops based on remaining ETA and the scheduled time between stops.
 * - The position is interpolated along the chunked segment according to this progress and returned as [longitude, latitude].
 *
 * @param {InferTrainPositionOnShapeParams} params - Parameters detailing the current and next stops, and route data.
 * @returns {[number, number]} Estimated [longitude, latitude] of the train along the shape.
 */
export function inferTrainPositionOnShape({ nextStop, nextStopWaypoint, previousStopWaypoint, ride }: InferTrainPositionOnShapeParams): [number, number] {
	// If this is the first stop (no previous waypoint), return next stop coordinates.
	if (!previousStopWaypoint) {
		return [nextStopWaypoint.longitude, nextStopWaypoint.latitude];
	}

	// Create a GeoJSON LineString for the hashed route shape.
	const hashedShapeLineString: Feature<LineString> = hashedShapesToFeatureCollection(ride.hashed_shape).features[0];

	// Create GeoJSON Points for the previous and next stop waypoints.
	const previousStopPoint: Feature<Point> = point([previousStopWaypoint.longitude, previousStopWaypoint.latitude]);
	const nextStopPoint: Feature<Point> = point([nextStopWaypoint.longitude, nextStopWaypoint.latitude]);

	// Snap stop points to the closest position on the route shape.
	const nearestPreviousStopPointOnShape = nearestPointOnLine(hashedShapeLineString, previousStopPoint);
	const nearestNextStopPointOnShape = nearestPointOnLine(hashedShapeLineString, nextStopPoint);

	// Slice the route shape between the snapped points and split it into ~25m chunks.
	const slicedShape = lineSlice(nearestPreviousStopPointOnShape, nearestNextStopPointOnShape, hashedShapeLineString);
	const chuckedLine = chunkLineByDistanceV2(slicedShape.geometry, 25);

	// If chunked line is empty or timing metrics are unavailable, return the midpoint as fallback.
	if (chuckedLine.coordinates.length === 0 || nextStopWaypoint.timeDifference <= 0) {
		return [
			(previousStopWaypoint.longitude + nextStopWaypoint.longitude) / 2,
			(previousStopWaypoint.latitude + nextStopWaypoint.latitude) / 2,
		];
	}

	// Given the time difference between the previous and the next stop,
	// and the next_stop: arrival_seconds we can calculate the percentage of the chunked line that the vehicle has traveled.
	// Eg. If ETA is 30s (nextStop.arrival_seconds) and delta between stops (nextStopWaypoint.timeDifference) is 120s
	// This means the vehicle has traveled 75% of the distance between the two stops, and it's missing the last 25%.
	// ((nextStopWaypoint.timeDifference - nextStop.arrival_seconds))/nextStopWaypoint.timeDifference = percentage of the chunked line that the vehicle has traveled
	const elapsedBetweenStops = nextStopWaypoint.timeDifference - nextStop.arrival_seconds;
	let percentageOfChunkedLine = elapsedBetweenStops / nextStopWaypoint.timeDifference;

	// Clamp or fallback to 0.5 if negative (sanity).
	if (percentageOfChunkedLine < 0) percentageOfChunkedLine = 0.5;

	// Get the index along the chunked segment that represents the current position.
	const coordinateIndex = Math.min(
		Math.max(0, Math.floor(percentageOfChunkedLine * (chuckedLine.coordinates.length - 1))),
		chuckedLine.coordinates.length - 1,
	);

	return chuckedLine.coordinates[coordinateIndex] as [number, number];
}
