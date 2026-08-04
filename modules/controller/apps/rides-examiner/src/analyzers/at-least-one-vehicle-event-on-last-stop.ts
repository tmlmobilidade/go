/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { Dates } from '@tmlmobilidade/dates';
import { type GeoJson2dPosition } from '@tmlmobilidade/go-types-geo';
import { type RideAnalysisAtLeastOneVehicleEventOnLastStop } from '@tmlmobilidade/go-types-operation';
import { getDistanceBetweenPositions } from '@tmlmobilidade/go-utils-geo';

/* * */

const BUFFER_RADIUS = 50; // meters

/**
 * This analyzer tests if the trip has at least one event on the first stop.
 *
 * GRADES:
 * → PASS = At least one event on the first stop.
 * → FAIL = No events found on the first stop.
 */
export function atLeastOneVehicleEventOnLastStopAnalyzer(analysisData: AnalysisData): RideAnalysisAtLeastOneVehicleEventOnLastStop {
	try {
		//

		//
		// Skip if the hashed trip is empty

		if (!analysisData.hashed_trip.length) {
			return {
				agency_id: analysisData.ride.agency_id,
				is_accepted: false,
				operational_date: analysisData.ride.operational_date,
				processing_status: 'skipped',
				reason: 'NO_PATH_DATA',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
				vehicle_events_on_last_stop_qty: null,
			};
		}

		//
		// Skip if the ride has no events

		if (!analysisData.vehicle_events.length) {
			return {
				agency_id: analysisData.ride.agency_id,
				is_accepted: false,
				operational_date: analysisData.ride.operational_date,
				processing_status: 'skipped',
				reason: 'NO_VEHICLE_EVENTS',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
				vehicle_events_on_last_stop_qty: null,
			};
		}

		//
		// Sort hashed trip by stop sequence

		const sortedHashedTrip = analysisData.hashed_trip.sort((a, b) => {
			return a.stop_sequence - b.stop_sequence;
		});

		let eventsFoundOnLastStop = 0;

		const lastStopPosition: GeoJson2dPosition = [sortedHashedTrip[sortedHashedTrip.length - 1].stop_lon, sortedHashedTrip[sortedHashedTrip.length - 1].stop_lat];

		for (const vehicleEvent of analysisData.vehicle_events) {
			// Check if the current event is inside the buffer of the first stop.
			const distanceToLastStop = getDistanceBetweenPositions(lastStopPosition, [vehicleEvent.longitude, vehicleEvent.latitude]);
			if (distanceToLastStop <= BUFFER_RADIUS) eventsFoundOnLastStop++;
		}

		if (eventsFoundOnLastStop > 0) {
			return {
				agency_id: analysisData.ride.agency_id,
				is_accepted: true,
				operational_date: analysisData.ride.operational_date,
				processing_status: 'complete',
				reason: 'ONE_OR_MORE_VEHICLE_EVENTS_ON_LAST_STOP',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
				vehicle_events_on_last_stop_qty: eventsFoundOnLastStop,
			};
		}

		return {
			agency_id: analysisData.ride.agency_id,
			is_accepted: false,
			operational_date: analysisData.ride.operational_date,
			processing_status: 'complete',
			reason: 'NO_VEHICLE_EVENTS_ON_LAST_STOP',
			remarks: null,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
			vehicle_events_on_last_stop_qty: eventsFoundOnLastStop,
		};

		//
	} catch (error) {
		return {
			agency_id: analysisData.ride.agency_id,
			is_accepted: false,
			operational_date: analysisData.ride.operational_date,
			processing_status: 'error',
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
			vehicle_events_on_last_stop_qty: null,
		};
	}
};
