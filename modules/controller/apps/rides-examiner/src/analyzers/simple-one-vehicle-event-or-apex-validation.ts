/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { Dates } from '@tmlmobilidade/dates';
import { type RideAnalysisSimpleOneVehicleEventOrApexValidation } from '@tmlmobilidade/go-types-operation';

/**
 * This analyzer tests if at least one vehicle event or one validation is found for the trip.
 *
 * GRADES:
 * → PASS = At least one Vehicle Event OR one Validation Transaction is found for the trip.
 * → FAIL = No Vehicle Events OR Validation Transactions found for the trip.
 */
export function simpleOneVehicleEventOrApexValidationAnalyzer(analysisData: AnalysisData): RideAnalysisSimpleOneVehicleEventOrApexValidation {
	try {
		//

		// 1.
		// Test if at least one Vehicle Event is found

		if (analysisData.vehicle_events.length > 0 || analysisData.apex_validations.length > 0) {
			return {
				agency_id: analysisData.ride.agency_id,
				grade_status: 'pass',
				operational_date: analysisData.ride.operational_date,
				reason: 'FOUND_VEHICLE_EVENT_OR_APEX_VALIDATION',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			};
		}

		return {
			agency_id: analysisData.ride.agency_id,
			grade_status: 'fail',
			operational_date: analysisData.ride.operational_date,
			reason: 'NO_VEHICLE_EVENTS_OR_APEX_VALIDATIONS',
			remarks: null,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
		};

		//
	} catch (error) {
		return {
			agency_id: analysisData.ride.agency_id,
			grade_status: 'error',
			operational_date: analysisData.ride.operational_date,
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
		};
	}
};
