/* * */

import { type HashedShape, type VehicleEvent } from '@tmlmobilidade/go-types';
import { chunkLineByDistance, cutLineStringAtLength, getDistanceBetweenPositions, sortByUnixTimestamp, toLineStringFromHashedShape } from '@tmlmobilidade/go-utils';

/* * */

const BUFFER_RADIUS = 50; // meters
const ENDING_SEGMENT_LENGTH = 5; // meters
const ENDING_SEGMENT_CHUNK_LENGTH = 50; // meters

/**
 * The trip end time is the time of the first event inside the geofence
 * of the last segment of the shape.
 * @param analysisData The analysis data containing the vehicle events, hashed trip, and hashed shape.
 * @returns The event which ends the trip.
 */
export function detectEndEvent(vehicleEventsData: VehicleEvent[], hashedShapeData: HashedShape): null | VehicleEvent {
	//

	//
	// Ensure that there are at least two vehicle events.
	// Sort them by vehicle timestamp.

	if (vehicleEventsData.length < 2) {
		// throw new Error('There must be at least two Vehicle Events.');
		return null;
	}

	const sortedVehicleEvents = sortByUnixTimestamp(vehicleEventsData, 'created_at', 'desc');

	//
	// Ensure that the hashed shape has at least two points.
	// Transform the GTFS shape points into a GeoJSON LineString
	// and cut it at 500 meters.

	if (hashedShapeData?.points?.length < 2) {
		// throw new Error('Hashed Shape must have at least two points.');
		return null;
	}

	const shapeAsLineString = toLineStringFromHashedShape(hashedShapeData);

	const initialSegmentOfShape = cutLineStringAtLength(shapeAsLineString, ENDING_SEGMENT_LENGTH, 'reversed');

	const initialSegmentOfShapeNormalized = chunkLineByDistance(initialSegmentOfShape, ENDING_SEGMENT_CHUNK_LENGTH);

	//
	// Detect the last event that is inside
	// the geofence of the initial segment of the shape.

	let firstEventInsideEndingSegment: null | VehicleEvent = null;

	for (const vehicleEvent of sortedVehicleEvents) {
		// Check if the current vehicle event has any point that is
		// less than or equal to 50 meters away from any point of the initial segment.
		const vehicleEventIsInsideEndingSegment = initialSegmentOfShapeNormalized.coordinates.some((positionOfEndingSegment) => {
			const distance = getDistanceBetweenPositions(positionOfEndingSegment, [vehicleEvent.longitude, vehicleEvent.latitude]);
			return distance <= BUFFER_RADIUS;
		});
		// If the event is NOT inside the geofence of the initial segment,
		// and an event was already found, then this means that the current event
		// is the last event inside the geofence of the initial segment.
		if (!vehicleEventIsInsideEndingSegment) {
			firstEventInsideEndingSegment = vehicleEvent;
			break;
		}
	}

	//
	// With all calculations done, the start event is the first event
	// inside the initial segment that is before the last event
	// of the first stop. Falback to the first event inside the
	// initial segment if no event was found inside the first stop.

	if (!firstEventInsideEndingSegment) {
		// throw new Error('No vehicle event was found inside the geofence of the initial segment.');
		return null;
	}

	return firstEventInsideEndingSegment;

	//
}
