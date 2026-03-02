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
export function simpleOneApexValidationAnalyzer(analysisData: AnalysisData): Ride['analysis']['SIMPLE_ONE_APEX_VALIDATION'] {
	try {
		//

		if (!analysisData.simplified_apex_validations.length) {
			return {
				grade: 'fail',
				reason: 'NO_APEX_VALIDATIONS',
				value: analysisData.simplified_apex_validations.length,
			};
		}

		return {
			grade: 'pass',
			reason: 'ONE_OR_MORE_APEX_VALIDATIONS',
			value: analysisData.simplified_apex_validations.length,
		};

		//
	} catch (error) {
		return {
			error_message: error.message,
			grade: 'error',
			reason: null,
			value: null,
		};
	}
};
