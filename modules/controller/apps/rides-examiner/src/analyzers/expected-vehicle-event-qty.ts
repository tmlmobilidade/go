/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { Dates } from '@tmlmobilidade/dates';
import { type RideAnalysisExpectedVehicleEventQty } from '@tmlmobilidade/go-types-operation';

/**
 * This analyzer tests if at the trip has less than ten Vehicle Events.
 *
 * GRADES:
 * → PASS = More than ten Vehicle Events found for the trip.
 * → FAIL = Less than or equal to ten Vehicle Events found for the trip.
 */
export function expectedVehicleEventQtyAnalyzer(analysisData: AnalysisData): RideAnalysisExpectedVehicleEventQty {
	try {
		//

		if (!analysisData.hashed_trip.length) {
			return {
				agency_id: analysisData.ride.agency_id,
				expected_vehicle_events_qty: null,
				grade_status: 'skip',
				observed_vehicle_events_qty: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_PATH_DATA',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			};
		}

		if (!analysisData.vehicle_events.length) {
			return {
				agency_id: analysisData.ride.agency_id,
				expected_vehicle_events_qty: null,
				grade_status: 'skip',
				observed_vehicle_events_qty: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_VEHICLE_EVENTS',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			};
		}

		//
		// Get expected Vehicle Event quantity

		const expectedQty = analysisData.hashed_trip.length * 2;

		if (analysisData.vehicle_events.length > expectedQty) {
			return {
				agency_id: analysisData.ride.agency_id,
				expected_vehicle_events_qty: expectedQty,
				grade_status: 'pass',
				observed_vehicle_events_qty: analysisData.vehicle_events.length,
				operational_date: analysisData.ride.operational_date,
				reason: 'EXPECTED_VEHICLE_EVENT_QTY',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			};
		}

		return {
			agency_id: analysisData.ride.agency_id,
			expected_vehicle_events_qty: expectedQty,
			grade_status: 'fail',
			observed_vehicle_events_qty: analysisData.vehicle_events.length,
			operational_date: analysisData.ride.operational_date,
			reason: 'UNEXPECTED_VEHICLE_EVENT_QTY',
			remarks: null,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
		};

		//
	} catch (error) {
		return {
			agency_id: analysisData.ride.agency_id,
			expected_vehicle_events_qty: null,
			grade_status: 'error',
			observed_vehicle_events_qty: null,
			operational_date: analysisData.ride.operational_date,
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
		};
	}
};
