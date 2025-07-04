/* * */

import { type HashedTripWaypoint, type VehicleEvent } from '@tmlmobilidade/types';
import { getGeofenceOnPosition, isPointInPolygon, sortByUnixTimestamp } from '@tmlmobilidade/utils';

/**
 * The trip end time is the time of the first event inside the geofence of the last stop
 * that is after the last event inside the geofence of the last before last stop.
 * @param hashedTripWaypointsData
 * @param vehicleEventsData
 * @returns The event which ends the trip.
 */
export function detectEndEvent(hashedTripWaypointsData: HashedTripWaypoint[], vehicleEventsData: VehicleEvent[]): null | VehicleEvent {
	//

	if (!hashedTripWaypointsData || !vehicleEventsData) {
		// throw new Error('Hashed Trip Waypoints Data and Vehicle Events Data are required.');
		return null;
	}

	//
	// Sort the path by stop_sequence and build a geofence
	// of 30 meters around the last and last before last stops of the trip.

	const sortedWaypoints = hashedTripWaypointsData.sort((a, b) => {
		return a.stop_sequence - b.stop_sequence;
	});

	if (sortedWaypoints.length < 2) {
		// throw new Error('Hashed Trip must have at least two stops.');
		return null;
	}

	const lastWaypoint = sortedWaypoints[sortedWaypoints.length - 1];

	const lastStopGeofence = getGeofenceOnPosition([lastWaypoint.stop_lon, lastWaypoint.stop_lat]);

	//
	// Sort vehicle events by vehicle timestamp

	const sortedVehicleEvents = sortByUnixTimestamp(vehicleEventsData, 'created_at', 'asc');

	//
	// Detect the first event that is inside the geofence of the last stop.

	let firstEventInsideLastStop: null | VehicleEvent = null;

	for (const vehicleEventData of sortedVehicleEvents) {
		const isInsideGeofence = isPointInPolygon([vehicleEventData.longitude, vehicleEventData.latitude], lastStopGeofence);
		if (isInsideGeofence) {
			firstEventInsideLastStop = vehicleEventData;
			break;
		}
	}

	if (firstEventInsideLastStop === null) {
		// throw new Error('No vehicle event was found inside the geofence of the last stop.');
		return null;
	}

	//
	// Return the timestamp of the first event found inside the geofence of the last stop.
	// This will be used as the end time of the trip.

	return firstEventInsideLastStop;

	//
}
