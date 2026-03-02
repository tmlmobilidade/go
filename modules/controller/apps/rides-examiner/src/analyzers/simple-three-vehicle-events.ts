/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if at least one stop_id is found for each segment of the trip.
 * The first three stops, the first middle 4 stops and the last 3 stops for each trip are saved.
 * Then, a simple lookup for any of these Stop IDs is performed.
 *
 * GRADES:
 * → PASS = At least one Stop ID is found for each segment of the trip.
 * → FAIL = At least one segment without any matching stops.
 */
export function simpleThreeVehicleEventsAnalyzer(analysisData: AnalysisData): Ride['analysis']['SIMPLE_THREE_VEHICLE_EVENTS'] {
	try {
		//

		if (!analysisData.hashed_trip?.path) {
			return {
				grade: 'fail',
				reason: 'NO_PATH_DATA',
				stop_ids_first: [],
				stop_ids_last: [],
				stop_ids_middle: [],
			};
		}

		//
		// Sort the path by stop_sequence

		const sortedTripPath = analysisData.hashed_trip?.path.sort((a, b) => {
			return a.stop_sequence - b.stop_sequence;
		});

		//
		// Initiate a Set for each segment

		const firstStopIds = new Set<string>();
		const foundFirstStopIds = new Set<string>();

		const middleStopIds = new Set<string>();
		const foundMiddleStopIds = new Set<string>();

		const lastStopIds = new Set<string>();
		const foundLastStopIds = new Set<string>();

		//
		// Get stops for each segment

		// Get first three stops of trip
		sortedTripPath.slice(0, 2).forEach(item => firstStopIds.add(item.stop_id));
		// Get middle three stops of trip
		const middlePathLength = Math.floor(sortedTripPath.length / 2);
		sortedTripPath.slice(middlePathLength - 2, middlePathLength + 2).forEach(item => middleStopIds.add(item.stop_id));
		// Get last three stops of trip
		sortedTripPath.slice(-2).forEach(item => lastStopIds.add(item.stop_id));

		//
		// Test if at least one stop is found for each segment

		for (const event of analysisData.vehicle_events) {
			if (firstStopIds.has(event.stop_id)) {
				foundFirstStopIds.add(event.stop_id);
			}
			if (middleStopIds.has(event.stop_id)) {
				foundMiddleStopIds.add(event.stop_id);
			}
			if (lastStopIds.has(event.stop_id)) {
				foundLastStopIds.add(event.stop_id);
			}
		}

		// 5.
		// Based on the test, attribute the grades

		if (!foundFirstStopIds.size) {
			return {
				grade: 'fail',
				reason: 'MISSING_FIRST_STOPS',
				stop_ids_first: Array.from(firstStopIds),
				stop_ids_last: Array.from(lastStopIds),
				stop_ids_middle: Array.from(middleStopIds),
			};
		}

		if (!foundMiddleStopIds.size) {
			return {
				grade: 'fail',
				reason: 'MISSING_MIDDLE_STOPS',
				stop_ids_first: Array.from(firstStopIds),
				stop_ids_last: Array.from(lastStopIds),
				stop_ids_middle: Array.from(middleStopIds),
			};
		}

		if (!foundLastStopIds.size) {
			return {
				grade: 'fail',
				reason: 'MISSING_LAST_STOPS',
				stop_ids_first: Array.from(firstStopIds),
				stop_ids_last: Array.from(lastStopIds),
				stop_ids_middle: Array.from(middleStopIds),
			};
		}

		return {
			grade: 'pass',
			reason: 'ALL_STOPS_FOUND',
			stop_ids_first: Array.from(firstStopIds),
			stop_ids_last: Array.from(lastStopIds),
			stop_ids_middle: Array.from(middleStopIds),
		};

		//
	} catch (error) {
		return {
			error_message: error.message,
			grade: 'error',
			reason: null,
			stop_ids_first: null,
			stop_ids_last: null,
			stop_ids_middle: null,
		};
	}
};
