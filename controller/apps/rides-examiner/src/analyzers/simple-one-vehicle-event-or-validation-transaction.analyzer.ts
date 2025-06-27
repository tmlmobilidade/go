/* * */

import { type AnalysisData } from '@/types/analysis-data.type.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if at least one vehicle event or one validation is found for the trip.
 *
 * GRADES:
 * → PASS = At least one Vehicle Event OR one Validation Transaction is found for the trip.
 * → FAIL = No Vehicle Events OR Validation Transactions found for the trip.
 */
export function simpleOneVehicleEventOrValidationTransactionAnalyzer(analysisData: AnalysisData): Ride['analysis']['SIMPLE_ONE_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION'] {
	try {
		//

		// 1.
		// Test if at least one Vehicle Event is found

		if (analysisData.vehicle_events.length > 0 || analysisData.simplified_apex_validations.length > 0) {
			return {
				grade: 'pass',
				message: `Found ${analysisData.vehicle_events.length} Vehicle Events and ${analysisData.simplified_apex_validations.length} Validation Transactions for this trip.`,
				reason: 'FOUND_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION',
				value: null,
			};
		}

		return {
			grade: 'fail',
			message: 'No Vehicle Events or Validation Transactions found for this trip.',
			reason: 'NO_VEHICLE_EVENT_OR_VALIDATION_TRANSACTION_FOUND',
			value: null,
		};

		//
	}
	catch (error) {
		return {
			grade: 'error',
			message: error.message,
			reason: null,
			value: null,
		};
	}
};
