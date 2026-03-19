/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if at least one vehicle event or one validation is found for the trip.
 *
 * GRADES:
 * → PASS = At least one Vehicle Event OR one Validation Transaction is found for the trip.
 * → FAIL = No Vehicle Events OR Validation Transactions found for the trip.
 */
export function simpleOneVehicleEventOrApexValidationAnalyzer(analysisData: AnalysisData): Ride['analysis']['SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION'] {
	try {
		//

		// 1.
		// Test if at least one Vehicle Event is found

		if (analysisData.vehicle_events.length > 0 || analysisData.simplified_apex_validations.length > 0) {
			return {
				grade: 'pass',
				reason: 'FOUND_VEHICLE_EVENT_OR_APEX_VALIDATION',
			};
		}

		return {
			grade: 'fail',
			reason: 'NO_VEHICLE_EVENTS_OR_APEX_VALIDATIONS',
		};

		//
	} catch (error) {
		return {
			error_message: error.message,
			grade: 'error',
			reason: null,
		};
	}
};
