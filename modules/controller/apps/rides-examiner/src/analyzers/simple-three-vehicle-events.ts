/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type RideAnalysisSimpleThreeVehicleEvents, RideAnalysisSimpleThreeVehicleEventsSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * This analyzer tests if at least one stop_id is found for each segment of the trip.
 * The first three stops, the first middle 4 stops and the last 3 stops for each trip are saved.
 * Then, a simple lookup for any of these Stop IDs is performed.
 *
 * GRADES:
 * → PASS = At least one Stop ID is found for each segment of the trip.
 * → FAIL = At least one segment without any matching stops.
 */
export function simpleThreeVehicleEventsAnalyzer(analysisData: AnalysisData): RideAnalysisSimpleThreeVehicleEvents {
	try {
		//

		if (!analysisData.hashed_trip.length) {
			return RideAnalysisSimpleThreeVehicleEventsSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'skip',
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_PATH_DATA',
				remarks: null,
				ride_id: analysisData.ride._id,
				stop_ids_first: [],
				stop_ids_last: [],
				stop_ids_middle: [],
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		//
		// Sort the path by stop_sequence

		const sortedTripPath = analysisData.hashed_trip.sort((a, b) => a.stop_sequence - b.stop_sequence);

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

		sortedTripPath.slice(0, 2).forEach(item => firstStopIds.add(item.stop_id));

		const middlePathLength = Math.floor(sortedTripPath.length / 2);
		sortedTripPath.slice(middlePathLength - 2, middlePathLength + 2).forEach(item => middleStopIds.add(item.stop_id));

		sortedTripPath.slice(-2).forEach(item => lastStopIds.add(item.stop_id));

		//
		// Test if at least one stop is found for each segment

		for (const vehicleEvent of analysisData.vehicle_events) {
			// Skip if no stop ID is found for this vehicle event
			if (!vehicleEvent.stop_id) continue;
			// Check if the stop ID is in the first segment
			if (firstStopIds.has(vehicleEvent.stop_id)) foundFirstStopIds.add(vehicleEvent.stop_id);
			// Check if the stop ID is in the middle segment
			if (middleStopIds.has(vehicleEvent.stop_id)) foundMiddleStopIds.add(vehicleEvent.stop_id);
			// Check if the stop ID is in the last segment
			if (lastStopIds.has(vehicleEvent.stop_id)) foundLastStopIds.add(vehicleEvent.stop_id);
		}

		//
		// If no stop is found for any segment, return a failed grade

		if (!foundFirstStopIds.size) {
			return RideAnalysisSimpleThreeVehicleEventsSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'fail',
				operational_date: analysisData.ride.operational_date,
				reason: 'MISSING_FIRST_STOPS',
				remarks: null,
				ride_id: analysisData.ride._id,
				stop_ids_first: Array.from(firstStopIds),
				stop_ids_last: Array.from(lastStopIds),
				stop_ids_middle: Array.from(middleStopIds),
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		if (!foundMiddleStopIds.size) {
			return RideAnalysisSimpleThreeVehicleEventsSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'fail',
				operational_date: analysisData.ride.operational_date,
				reason: 'MISSING_MIDDLE_STOPS',
				remarks: null,
				ride_id: analysisData.ride._id,
				stop_ids_first: Array.from(firstStopIds),
				stop_ids_last: Array.from(lastStopIds),
				stop_ids_middle: Array.from(middleStopIds),
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		if (!foundLastStopIds.size) {
			return RideAnalysisSimpleThreeVehicleEventsSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'fail',
				operational_date: analysisData.ride.operational_date,
				reason: 'MISSING_LAST_STOPS',
				remarks: null,
				ride_id: analysisData.ride._id,
				stop_ids_first: Array.from(firstStopIds),
				stop_ids_last: Array.from(lastStopIds),
				stop_ids_middle: Array.from(middleStopIds),
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		return RideAnalysisSimpleThreeVehicleEventsSchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'pass',
			operational_date: analysisData.ride.operational_date,
			reason: 'ALL_STOPS_FOUND',
			remarks: null,
			ride_id: analysisData.ride._id,
			stop_ids_first: Array.from(firstStopIds),
			stop_ids_last: Array.from(lastStopIds),
			stop_ids_middle: Array.from(middleStopIds),
			updated_at: Dates.now('utc').unix_timestamp,
		});

		//
	} catch (error) {
		return RideAnalysisSimpleThreeVehicleEventsSchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'error',
			operational_date: analysisData.ride.operational_date,
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			stop_ids_first: [],
			stop_ids_last: [],
			stop_ids_middle: [],
			updated_at: Dates.now('utc').unix_timestamp,
		});
	}
};
