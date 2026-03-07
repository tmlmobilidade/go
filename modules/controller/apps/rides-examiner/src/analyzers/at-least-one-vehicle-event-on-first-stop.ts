/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { getDistanceBetweenPositions } from '@tmlmobilidade/geo';
import { type Ride } from '@tmlmobilidade/types';

/* * */

const BUFFER_RADIUS = 50; // meters

/**
 * This analyzer tests if the trip has at least one event on the first stop.
 *
 * GRADES:
 * → PASS = At least one event on the first stop.
 * → FAIL = No events found on the first stop.
 */
export function atLeastOneVehicleEventOnFirstStopAnalyzer(analysisData: AnalysisData): Ride['analysis']['AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP'] {
	try {
		//

		//
		// Skip if the hashed trip is empty

		if (!analysisData.hashed_trip.path.length) {
			return {
				grade: 'skip',
				reason: 'NO_PATH_DATA',
				value: null,
			};
		}

		//
		// Skip if the ride has no events

		if (!analysisData.vehicle_events.length) {
			return {
				grade: 'skip',
				reason: 'NO_VEHICLE_EVENTS',
				value: null,
			};
		}

		//
		// Sort waypoints by stop sequence

		const sortedWaypoints = analysisData.hashed_trip.path.sort((a, b) => {
			return a.stop_sequence - b.stop_sequence;
		});

		let eventsFoundOnFirstStop = 0;
		const firstStopPosition = [Number(sortedWaypoints[0].stop_lon), Number(sortedWaypoints[0].stop_lat)];

		for (const vehicleEvent of analysisData.vehicle_events) {
			// Check if the current event is inside the buffer of the first stop.
			const distanceToFirstStop = getDistanceBetweenPositions(firstStopPosition, [vehicleEvent.longitude, vehicleEvent.latitude]);
			if (distanceToFirstStop <= BUFFER_RADIUS) eventsFoundOnFirstStop++;
		}

		if (eventsFoundOnFirstStop > 0) {
			return {
				grade: 'pass',
				reason: 'ONE_OR_MORE_VEHICLE_EVENTS_ON_FIRST_STOP',
				value: eventsFoundOnFirstStop,
			};
		}

		return {
			grade: 'fail',
			reason: 'NO_VEHICLE_EVENTS_ON_FIRST_STOP',
			value: eventsFoundOnFirstStop,
		};

		//
	} catch (error) {
		return {
			error_message: error.message,
			grade: 'error',
			reason: null,
			value: null,
		};
	}
};
