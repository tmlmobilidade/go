/* * */

import { type AnalysisData } from '@/types/analysis-data.type.js';
import { getDistanceBetweenPositions } from '@tmlmobilidade/sae-controller-pckg-utils';
import { type RideAnalysis } from '@tmlmobilidade/types';

/* * */

const BUFFER_RADIUS = 50; // meters

/* * */

interface ExplicitRideAnalysis extends RideAnalysis {
	reason: 'FOUND_ONE_OR_MORE_EVENTS_ON_FIRST_STOP' | 'NO_EVENTS_FOUND_ON_FIRST_STOP'
	unit: 'EVENTS_FOUND_ON_FIRST_STOP'
};

/**
 * This analyzer tests if the trip has at least one event on the first stop.
 *
 * GRADES:
 * → PASS = At least one event on the first stop.
 * → FAIL = No events found on the first stop.
 */
export function atLeastOneEventOnFirstStop(analysisData: AnalysisData): ExplicitRideAnalysis {
	try {
		//

		//
		// Exit if the ride has no events.

		if (!analysisData.vehicle_events.length) {
			return {
				grade: 'fail',
				message: 'Ride has no events.',
				reason: 'NO_EVENTS_FOUND_ON_FIRST_STOP',
				unit: 'EVENTS_FOUND_ON_FIRST_STOP',
				value: 0,
			};
		}

		//
		// Exit if the hashed trip is empty.

		if (!analysisData.hashed_trip.path.length) {
			throw new Error('Hashed Trip is empty.');
		}

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
				message: 'Found at least one event on the first stop.',
				reason: 'FOUND_ONE_OR_MORE_EVENTS_ON_FIRST_STOP',
				unit: 'EVENTS_FOUND_ON_FIRST_STOP',
				value: eventsFoundOnFirstStop,
			};
		}

		return {
			grade: 'fail',
			message: `No events found on the first stop.`,
			reason: 'NO_EVENTS_FOUND_ON_FIRST_STOP',
			unit: 'EVENTS_FOUND_ON_FIRST_STOP',
			value: 0,
		};

		//
	}
	catch (error) {
		return {
			grade: 'error',
			message: error.message,
			reason: null,
			unit: null,
			value: null,
		};
	}
};
