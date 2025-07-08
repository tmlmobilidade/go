/* * */

import { type AnalysisData } from '@/types/analysis-data.type.js';
import { type Ride } from '@tmlmobilidade/types';
import { getDistanceBetweenPositions, sortByUnixTimestamp } from '@tmlmobilidade/utils';

/* * */

const BUFFER_RADIUS = 50; // meters

/**
 * This analyzer tests if the ride ended at the last stop or not.
 *
 * GRADES:
 * → PASS = At least one event on the last stop.
 * → FAIL = No events found on the last stop.
 */
export function endedAtLastStopAnalyzer(analysisData: AnalysisData): Ride['analysis']['ENDED_AT_LAST_STOP'] {
	//

	//
	// Exit if the ride has no events.

	if (!analysisData.vehicle_events.length) {
		return {
			grade: 'fail',
			message: 'Ride has no events.',
			reason: 'NO_VEHICLE_EVENTS_FOUND',
			value: null,
		};
	}

	//
	// Exit if the hashed trip is empty.

	if (analysisData.hashed_trip.path.length < 2) {
		return {
			grade: 'fail',
			message: 'Ride has no path data.',
			reason: 'NO_PATH_DATA',
			value: null,
		};
	}

	//
	// Sort the waypoints by stop_sequence to ensure
	// we are checking the last stop. Also sort the vehicle events
	// by timestamp in descending order to ensure we are checking
	// the last events first.

	const sortedWaypoints = analysisData.hashed_trip.path.sort((a, b) => {
		return a.stop_sequence - b.stop_sequence;
	});

	const sortedVehicleEvents = sortByUnixTimestamp(analysisData.vehicle_events, 'created_at', 'desc');

	//
	// Get the last stop position from the sorted waypoints.

	const lastStopData = sortedWaypoints[sortedWaypoints.length - 1];
	const lastStopPosition = [lastStopData.stop_lon, lastStopData.stop_lat];

	//
	// Check if the last stop position is within the buffer radius of any vehicle event.

	for (const vehicleEvent of sortedVehicleEvents) {
		const vehicleEventPosition = [vehicleEvent.longitude, vehicleEvent.latitude];
		const distance = getDistanceBetweenPositions(lastStopPosition, vehicleEventPosition);
		if (distance <= BUFFER_RADIUS) {
			return {
				grade: 'pass',
				message: 'Ride ended at the last stop.',
				reason: 'ENDED_AT_LAST_STOP',
				value: null,
			};
		}
	}

	return {
		grade: 'fail',
		message: 'No event was detected in last stop.',
		reason: 'ENDED_OUTSIDE_OF_LAST_STOP',
		value: null,
	};

	//
};
