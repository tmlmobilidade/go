/* * */

import { chunkLineStringByDistance, cutLineStringAtLength, fromEncodedPolylineToGeoJsonLineString, getDistanceBetweenPositions } from '@tmlmobilidade/go-utils-geo';

import { type PickedHashedShape, type PickedSimplifiedVehicleEvent } from '../types/analysis-data.js';

/* * */

const BUFFER_RADIUS = 50; // meters
const ENDING_SEGMENT_LENGTH = 5; // meters
const ENDING_SEGMENT_CHUNK_LENGTH = 50; // meters

/**
 * The trip end time is the time of the last event inside the geofence
 * of the ending segment of the shape.
 * @param rideData The ride data.
 * @param vehicleEventsData The vehicle events data.
 * @returns The event which ends the trip.
 */
export function detectEndEvent(hashedShapeData: null | PickedHashedShape, vehicleEventsData: PickedSimplifiedVehicleEvent[]): null | PickedSimplifiedVehicleEvent {
	//

	//
	// Ensure that there are at least two vehicle events.
	// Sort them by vehicle timestamp in descending order.

	if (vehicleEventsData.length < 2) return null;

	const sortedVehicleEvents = vehicleEventsData.sort((a, b) => b.created_at - a.created_at);

	//
	// Decode the EncodedPolyline of the shape into a GeoJSON LineString,
	// cut it at the ending segment length, and chunk it into segments of the ending segment chunk length.

	if (!hashedShapeData) return null;

	const shapeAsGeoJsonLineString = fromEncodedPolylineToGeoJsonLineString(hashedShapeData.shape_polyline);
	if (!shapeAsGeoJsonLineString) return null;

	const endingSegmentOfShape = cutLineStringAtLength(shapeAsGeoJsonLineString, ENDING_SEGMENT_LENGTH, 'reversed');
	if (!endingSegmentOfShape) return null;

	const endingSegmentOfShapeNormalized = chunkLineStringByDistance(endingSegmentOfShape, ENDING_SEGMENT_CHUNK_LENGTH);

	//
	// Detect the last event that is inside
	// the geofence of the ending segment of the shape.

	let lastEventInsideEndingSegment: null | PickedSimplifiedVehicleEvent = null;

	for (const vehicleEvent of sortedVehicleEvents) {
		// Check if the current vehicle event has any point that is
		// less than or equal to 50 meters away from any point of the ending segment.
		const vehicleEventIsInsideEndingSegment = endingSegmentOfShapeNormalized.coordinates.some((positionOfEndingSegment) => {
			const distance = getDistanceBetweenPositions(positionOfEndingSegment, [vehicleEvent.longitude, vehicleEvent.latitude]);
			return distance <= BUFFER_RADIUS;
		});
		// If the event is NOT inside the geofence of the ending segment,
		// and an event was already found, then this means that the current event
		// is the last event inside the geofence of the ending segment.
		if (!vehicleEventIsInsideEndingSegment) {
			lastEventInsideEndingSegment = vehicleEvent;
			break;
		}
	}

	//
	// With all calculations done, the end event is the last event
	// inside the ending segment of the shape.

	return lastEventInsideEndingSegment;
}
