/* * */

import { type AnalysisData } from '@/types/analysis-data.type.js';
import { sortByTimestamp } from '@/utils/sort-by-timestamp.util.js';
import { type VehicleEvent } from '@tmlmobilidade/core/types';
import { getGeofenceOnPath, getGeofenceOnPoint, getGeoJsonPointFromAny, isInsideGeofence } from '@tmlmobilidade/sae-controller-pckg-utils';
import { lineString } from '@turf/turf';

/**
 * The trip start time is the time of the last event inside the geofence of the first stop
 * that is before the last event inside the complex geofence of the first stop on the path.
 * @param hashedTripWaypointsData
 * @param vehicleEventsData
 * @returns The event which starts the trip.
 */
export function detectStartEventAlt(analysisData: AnalysisData): null | VehicleEvent {
	//

	//
	// Ensure that the hashed trip has at least two stops.
	// Sort the waypoints by stop_sequence.

	if (analysisData.hashed_trip.path.length < 2) {
		// throw new Error('Hashed Trip must have at least two stops.');
		return null;
	}

	const sortedWaypoints = analysisData.hashed_trip.path.sort((a, b) => {
		return a.stop_sequence - b.stop_sequence;
	});

	//
	// Ensure that the hashed shape has at least two points.
	// Sort the shape points by shape_pt_sequence.

	if (analysisData.hashed_shape.points.length < 2) {
		// throw new Error('Hashed Shape must have at least two points.');
		return null;
	}

	const sortedShapePoints = analysisData.hashed_shape.points.sort((a, b) => {
		return a.shape_pt_sequence - b.shape_pt_sequence;
	});

	const geojsonPath = lineString(sortedShapePoints.map(point => [Number(point.shape_pt_lon), Number(point.shape_pt_lat)]));

	//
	// Ensure that there are at least two vehicle events.
	// Sort them by vehicle timestamp.

	if (analysisData.vehicle_events.length < 2) {
		// throw new Error('There must be at least two Vehicle Events.');
		return null;
	}

	const sortedVehicleEvents = sortByTimestamp(analysisData.vehicle_events, 'created_at');

	//
	// Get the first stop and create a geofence on it.

	const firstStopPoint = getGeoJsonPointFromAny([Number(sortedWaypoints[0].stop_lon), Number(sortedWaypoints[0].stop_lat)]);
	const geofenceOnFirstStop = getGeofenceOnPoint(firstStopPoint);

	//
	// Create a geofence on the path from the first stop.
	// Since we're building a geofence from the first stop,
	// there is no need to check before the path.

	const geofenceOnPath = getGeofenceOnPath(geojsonPath, firstStopPoint, { geofence_radius: 50, meters_backward: 0, meters_forward: 500 });

	//
	// Detect the last event that is inside the geofence on the path.

	let lastEventInsidePath: null | VehicleEvent = null;

	for (const vehicleEventData of sortedVehicleEvents) {
		// Check if the event is inside the geofence on the path
		const vehicleEventIsOnPath = isInsideGeofence([vehicleEventData.longitude, vehicleEventData.latitude], geofenceOnPath);
		// If the event is inside the geofence on the path and this is the first event found,
		// set that variable to the current event.
		if (vehicleEventIsOnPath && !lastEventInsidePath) {
			lastEventInsidePath = vehicleEventData;
		}
		// If the event is NOT inside the geofence on the path and an event was already found,
		// then this means that it is the last event inside the geofence on the path.
		if (!vehicleEventIsOnPath && lastEventInsidePath) {
			lastEventInsidePath = vehicleEventData;
			break;
		}
	}

	if (lastEventInsidePath === null) {
		// throw new Error('No vehicle event was found inside the geofence of the second stop.');
		return null;
	}

	//
	// Now detect the last event that is inside the geofence of the first stop,
	// and that is before the last event found inside the geofence of the path.

	let lastEventInsideFirstStop: null | VehicleEvent = null;

	for (const vehicleEventData of sortedVehicleEvents) {
		const vehicleEventIsInsideGeofenceOfFirstStop = isInsideGeofence([vehicleEventData.longitude, vehicleEventData.latitude], geofenceOnFirstStop);
		if (vehicleEventIsInsideGeofenceOfFirstStop) {
			// Check if the event is before the first event found inside the geofence of the second stop
			if (vehicleEventData.created_at < lastEventInsidePath.created_at) {
				lastEventInsideFirstStop = vehicleEventData;
			}
			else break;
		}
	}

	if (lastEventInsideFirstStop === null) {
		// throw new Error('No vehicle event was found inside the geofence of the first stop.');
		return null;
	}

	//
	// Return the timestamp of the last event found inside the geofence of the first stop.
	// This will be used as the start time of the trip.

	return lastEventInsideFirstStop;

	//
}
