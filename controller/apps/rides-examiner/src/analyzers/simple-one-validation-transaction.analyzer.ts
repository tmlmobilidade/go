/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if at least one validation is found for the trip.
 *
 * GRADES:
 * → PASS = At least one Validation Transaction is found for the trip.
 * → FAIL = No Validation Transactions found for the trip.
 */
export function simpleOneValidationTransactionAnalyzer(analysisData: AnalysisData): Ride['analysis']['SIMPLE_ONE_VALIDATION_TRANSACTION'] {
	try {
		//

		// 1.
		// Test if at least one Validation Transaction is found

		if (analysisData.simplified_apex_validations.length > 0) {
			return {
				grade: 'pass',
				message: `Found ${analysisData.simplified_apex_validations.length} Validation Transactions for this trip.`,
				reason: 'FOUND_AT_LEAST_ONE_VALIDATION_TRANSACTION',
				value: analysisData.simplified_apex_validations.length,
			};
		}

		return {
			grade: 'fail',
			message: 'No Validation Transactions found for this trip.',
			reason: 'NO_VALIDATION_TRANSACTION_FOUND',
			value: 0,
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
