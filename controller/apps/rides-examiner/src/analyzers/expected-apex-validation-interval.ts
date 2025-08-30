/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';
import { sortByUnixTimestamp } from '@tmlmobilidade/utils';

/**
 * This analyzer tests if the interval between validations is normal or not.
 * GRADES:
 * → PASS = Interval between Validation transactions is greater than or equal to 3 seconds.
 * → FAIL = Interval between Validation transactions is less than 3 seconds.
 */
export function expectedApexValidationIntervalAnalyzer(analysisData: AnalysisData): Ride['analysis']['EXPECTED_APEX_VALIDATION_INTERVAL'] {
	try {
		//

		//
		// Skip if there are no validation transactions

		if (!analysisData.simplified_apex_validations.length) {
			return {
				grade: 'skip',
				reason: 'NO_APEX_VALIDATIONS',
				value: null,
			};
		}

		//
		// Sort validations by created_at timestamp

		const sortedValidations = sortByUnixTimestamp(analysisData.simplified_apex_validations, 'created_at', 'asc');

		//
		// Evaluate the interval between each validation

		let countOfAbnormalIntervalsBetweenSequentialValidations = 0;

		let previousValidationTimestamp = sortedValidations[0].created_at;

		for (let index = 1; index < sortedValidations.length; index++) {
			const delayInSeconds = sortedValidations[index].created_at - previousValidationTimestamp;
			if (delayInSeconds < 3) countOfAbnormalIntervalsBetweenSequentialValidations++;
			previousValidationTimestamp = sortedValidations[index].created_at;
		}

		//
		// Fail the test if at least one was found

		if (countOfAbnormalIntervalsBetweenSequentialValidations > 0) {
			return {
				grade: 'fail',
				reason: 'UNEXPECTED_VALIDATION_INTERVALS',
				value: countOfAbnormalIntervalsBetweenSequentialValidations,
			};
		}

		return {
			grade: 'pass',
			reason: 'EXPECTED_VALIDATION_INTERVALS',
			value: countOfAbnormalIntervalsBetweenSequentialValidations,
		};

		//
	}
	catch (error) {
		return {
			error_message: error.message,
			grade: 'error',
			reason: null,
			value: null,
		};
	}
};
