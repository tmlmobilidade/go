/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { Dates } from '@tmlmobilidade/dates';
import { type RideAnalysisSimpleOneApexValidation } from '@tmlmobilidade/go-types-operation';

/**
 * This analyzer tests if at least one validation is found for the trip.
 *
 * GRADES:
 * → PASS = At least one Validation Transaction is found for the trip.
 * → FAIL = No Validation Transactions found for the trip.
 */
export function simpleOneApexValidationAnalyzer(analysisData: AnalysisData): RideAnalysisSimpleOneApexValidation {
	try {
		//

		if (!analysisData.apex_validations.length) {
			return {
				agency_id: analysisData.ride.agency_id,
				grade_status: 'skipped',
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_APEX_VALIDATIONS',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			};
		}

		return {
			agency_id: analysisData.ride.agency_id,
			grade_status: 'pass',
			operational_date: analysisData.ride.operational_date,
			reason: 'ONE_OR_MORE_APEX_VALIDATIONS',
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
