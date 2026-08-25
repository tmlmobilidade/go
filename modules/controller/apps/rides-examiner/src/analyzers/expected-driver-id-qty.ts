/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type RideAnalysisExpectedDriverIdQty, RideAnalysisExpectedDriverIdQtySchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

const EXPECTED_DRIVER_IDS_QTY = 2;

/**
 * This analyzer tests if the trip has at most two drivers (at least one, maximum of two).
 *
 * GRADES:
 * → PASS = At least one Driver, and maximum two Driver IDs for the trip.
 * → FAIL = No Driver or more than two Drivers IDs for the trip.
 */
export function expectedDriverIdQtyAnalyzer(analysisData: AnalysisData): RideAnalysisExpectedDriverIdQty {
	try {
		//

		if (!analysisData.vehicle_events.length) {
			return RideAnalysisExpectedDriverIdQtySchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'skip',
				observed_driver_ids_qty: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_VEHICLE_EVENTS',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		if (analysisData.ride.driver_ids.length > EXPECTED_DRIVER_IDS_QTY) {
			return RideAnalysisExpectedDriverIdQtySchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'fail',
				observed_driver_ids_qty: analysisData.ride.driver_ids.length,
				operational_date: analysisData.ride.operational_date,
				reason: 'UNEXPECTED_DRIVER_ID_QTY',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		return RideAnalysisExpectedDriverIdQtySchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'pass',
			observed_driver_ids_qty: analysisData.ride.driver_ids.length,
			operational_date: analysisData.ride.operational_date,
			reason: 'EXPECTED_DRIVER_ID_QTY',
			remarks: null,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
		});

		//
	} catch (error) {
		return RideAnalysisExpectedDriverIdQtySchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'error',
			observed_driver_ids_qty: null,
			operational_date: analysisData.ride.operational_date,
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
		});
	}
};
