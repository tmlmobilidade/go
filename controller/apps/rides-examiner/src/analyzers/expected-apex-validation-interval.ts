/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';
import { coefficientOfVariation, entropy, roundNumberBias, sortByUnixTimestamp } from '@tmlmobilidade/utils';

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
		// Skip if there are not enough APEX Validations

		if (!analysisData.simplified_apex_validations.length) {
			return {
				grade: 'skip',
				reason: 'NO_APEX_VALIDATIONS',
			};
		}

		if (analysisData.simplified_apex_validations.length < 2) {
			return {
				grade: 'skip',
				reason: 'NOT_ENOUGH_VALIDATIONS',
			};
		}

		//
		// Sort validations by created_at timestamp

		const sortedValidations = sortByUnixTimestamp(analysisData.simplified_apex_validations, 'created_at', 'asc');

		//
		// Evaluate the interval between each validation

		let tooShortIntervalsQty = 0;
		const observedDelays: number[] = [];

		let previousValidationTimestamp = sortedValidations[0].created_at;

		for (let index = 1; index < sortedValidations.length; index++) {
			const delayInMilliseconds = sortedValidations[index].created_at - previousValidationTimestamp;
			observedDelays.push(delayInMilliseconds);
			if (delayInMilliseconds < 3000) tooShortIntervalsQty++;
			previousValidationTimestamp = sortedValidations[index].created_at;
		}

		//
		// Fail the test if at least one was found

		if (tooShortIntervalsQty > 0) {
			return {
				grade: 'fail',
				reason: 'INTERVALS_TOO_SHORT',
			};
		}

		//
		// The following checks require at least 10 APEX validations

		if (analysisData.simplified_apex_validations.length < 10) {
			return {
				grade: 'pass',
				reason: 'EXPECTED_VALIDATION_INTERVALS',
			};
		}

		//
		// Check if all observed delays are organic

		let syntheticScore = 0;

		const coefficientOfVariationResult = coefficientOfVariation(observedDelays);
		if (coefficientOfVariationResult < 0.05) syntheticScore += 3;
		else if (coefficientOfVariationResult > 1.5) syntheticScore += 2;

		const entropyResult = entropy(observedDelays);
		if (entropyResult < 1) syntheticScore += 2;
		else if (entropyResult > 5) syntheticScore += 2;

		const roundNumberBiasResult = roundNumberBias(observedDelays);
		if (roundNumberBiasResult > 0.6) syntheticScore += 2;

		if (syntheticScore >= 4) {
			return {
				grade: 'fail',
				reason: 'NON_ORGANIC_INTERVALS',
			};
		}

		//
		// Return a passing grade

		return {
			grade: 'pass',
			reason: 'EXPECTED_VALIDATION_INTERVALS',
		};

		//
	}
	catch (error) {
		return {
			error_message: error.message,
			grade: 'error',
			reason: null,
		};
	}
};
