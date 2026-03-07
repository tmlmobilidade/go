/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { sortByUnixTimestamp } from '@tmlmobilidade/dates';
import { getDistanceBetweenPositions } from '@tmlmobilidade/geo';
import { type Ride } from '@tmlmobilidade/types';

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
	try {
		//

		//
		// Skip if the hashed trip is empty.

		if (analysisData.hashed_trip.path.length < 2) {
			return {
				grade: 'skip',
				reason: 'NO_PATH_DATA',
			};
		}

		//
		// Skip if the ride has no events.

		if (!analysisData.vehicle_events.length) {
			return {
				grade: 'skip',
				reason: 'NO_VEHICLE_EVENTS',
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
					reason: 'ENDED_AT_LAST_STOP',
				};
			}
		}

		return {
			grade: 'fail',
			reason: 'ENDED_OUTSIDE_OF_LAST_STOP',
		};

	//
	} catch (error) {
		return {
			error_message: error.message,
			grade: 'error',
			reason: null,
		};
	}
};
