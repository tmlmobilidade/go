/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type RideAnalysisExpectedVehicleIdQty, RideAnalysisExpectedVehicleIdQtySchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

const EXPECTED_VEHICLE_IDS_QTY = 2;

/**
 * This analyzer tests if the trip has at most two vehicle IDs (at least one, maximum of two).
 *
 * GRADES:
 * → PASS = At least one Vehicle, and maximum two Vehicle IDs for the trip.
 * → FAIL = No Vehicle or more than two Vehicle IDs for the trip.
 */
export function expectedVehicleIdQtyAnalyzer(analysisData: AnalysisData): RideAnalysisExpectedVehicleIdQty {
	try {
		//

		if (!analysisData.vehicle_events.length) {
			return RideAnalysisExpectedVehicleIdQtySchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'skip',
				observed_vehicle_ids_qty: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_VEHICLE_EVENTS',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		if (analysisData.ride.vehicle_ids.length > EXPECTED_VEHICLE_IDS_QTY) {
			return RideAnalysisExpectedVehicleIdQtySchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'fail',
				observed_vehicle_ids_qty: analysisData.ride.vehicle_ids.length,
				operational_date: analysisData.ride.operational_date,
				reason: 'UNEXPECTED_VEHICLE_ID_QTY',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		return RideAnalysisExpectedVehicleIdQtySchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'pass',
			observed_vehicle_ids_qty: analysisData.ride.vehicle_ids.length,
			operational_date: analysisData.ride.operational_date,
			reason: 'EXPECTED_VEHICLE_ID_QTY',
			remarks: null,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
		});

		//
	} catch (error) {
		return RideAnalysisExpectedVehicleIdQtySchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'error',
			observed_vehicle_ids_qty: null,
			operational_date: analysisData.ride.operational_date,
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
		});
	}
};
