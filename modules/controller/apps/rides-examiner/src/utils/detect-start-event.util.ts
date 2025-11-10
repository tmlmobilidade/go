/* * */

import { sortByUnixTimestamp } from '@tmlmobilidade/dates';
import { chunkLineByDistance, cutLineStringAtLength, getDistanceBetweenPositions, toLineStringFromHashedShape } from '@tmlmobilidade/geo';
import { type HashedShape, type HashedTrip, type VehicleEvent } from '@tmlmobilidade/types';

/* * */

const BUFFER_RADIUS = 50; // meters
const INITIAL_SEGMENT_LENGTH = 500; // meters
const INITIAL_SEGMENT_CHUNK_LENGTH = 50; // meters

/**
 * The ride start time is the time of the last event inside the geofence of the first stop
 * that is before the last event inside the geofence of the initial segment of the shape.
 * @param analysisData The analysis data containing the vehicle events, hashed trip, and hashed shape.
 * @returns The event which starts the trip.
 */
export function detectStartEvent(vehicleEventsData: VehicleEvent[], hashedTripData: HashedTrip, hashedShapeData: HashedShape): null | VehicleEvent {
	//

	//
	// Ensure that there are at least two vehicle events.
	// Sort them by vehicle timestamp.

	if (vehicleEventsData.length < 2) {
		// throw new Error('There must be at least two Vehicle Events.');
		return null;
	}

	const sortedVehicleEvents = sortByUnixTimestamp(vehicleEventsData, 'created_at');

	//
	// Ensure that the hashed trip is not empty.

	if (!hashedTripData?.path?.length) {
		// throw new Error('Hashed Trip is empty.');
		return null;
	}

	const sortedWaypoints = hashedTripData.path.sort((a, b) => {
		return a.stop_sequence - b.stop_sequence;
	});

	const firstStopPosition = [Number(sortedWaypoints[0].stop_lon), Number(sortedWaypoints[0].stop_lat)];

	//
	// Ensure that the hashed shape has at least two points.
	// Transform the GTFS shape points into a GeoJSON LineString
	// and cut it at 500 meters.

	if (hashedShapeData?.points?.length < 2) {
		// throw new Error('Hashed Shape must have at least two points.');
		return null;
	}

	const shapeAsLineString = toLineStringFromHashedShape(hashedShapeData);

	const initialSegmentOfShape = cutLineStringAtLength(shapeAsLineString, INITIAL_SEGMENT_LENGTH);

	const initialSegmentOfShapeNormalized = chunkLineByDistance(initialSegmentOfShape, INITIAL_SEGMENT_CHUNK_LENGTH);

	//
	// Detect the last event that is inside
	// the geofence of the initial segment of the shape.

	let lastEventInsideInitialSegment: null | VehicleEvent = null;
	let firstEventInsideInitialSegment: null | VehicleEvent = null;
	let lastEventInsideFirstStop: null | VehicleEvent = null;

	for (const vehicleEvent of sortedVehicleEvents) {
		//
		// Check if the current vehicle event has any point that is
		// less than or equal to 50 meters away from any point of the initial segment.
		const vehicleEventIsInsideInitialSegment = initialSegmentOfShapeNormalized.coordinates.some((positionOfInitialSegment) => {
			const distance = getDistanceBetweenPositions(positionOfInitialSegment, [vehicleEvent.longitude, vehicleEvent.latitude]);
			return distance <= BUFFER_RADIUS;
		});

		// Check if the current event is inside the buffer of the first stop.
		const distanceToFirstStop = getDistanceBetweenPositions(firstStopPosition, [vehicleEvent.longitude, vehicleEvent.latitude]);
		if (distanceToFirstStop <= BUFFER_RADIUS) lastEventInsideFirstStop = vehicleEvent;

		// If no event was yet found inside the geofence of the initial segment,
		// and the current event is inside the geofence of the initial segment,
		// set that variable to the current event.
		if (vehicleEventIsInsideInitialSegment && !firstEventInsideInitialSegment) {
			firstEventInsideInitialSegment = vehicleEvent;
		}

		// If the event is inside the geofence of the initial segment,
		// set the last event inside the initial segment to the current event.
		if (vehicleEventIsInsideInitialSegment && !lastEventInsideInitialSegment) {
			lastEventInsideInitialSegment = vehicleEvent;
		}

		// If the event is NOT inside the geofence of the initial segment,
		// and an event was already found, then this means that the current event
		// is the last event inside the geofence of the initial segment.
		if (!vehicleEventIsInsideInitialSegment && lastEventInsideInitialSegment) {
			lastEventInsideInitialSegment = vehicleEvent;
			break;
		}
	}

	//
	// With all calculations done, the start event is the first event
	// inside the initial segment that is before the last event
	// of the first stop. Falback to the first event inside the
	// initial segment if no event was found inside the first stop.

	if (!lastEventInsideInitialSegment || !firstEventInsideInitialSegment) {
		// throw new Error('No vehicle event was found inside the geofence of the initial segment.');
		return null;
	}

	if (!lastEventInsideFirstStop) {
		return null;
		// return firstEventInsideInitialSegment;
	}

	return lastEventInsideFirstStop;

	//
}
