/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { sortByUnixTimestamp } from '@tmlmobilidade/dates';
import { type Ride, type SimplifiedApexValidation } from '@tmlmobilidade/types';

/* * */

const MIN_ALLOWED_INTERVAL_MS = 2000;

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
		// Separate validations by SAM Serial Number
		// and sort them by created_at timestamp

		const groupedValidations = analysisData.simplified_apex_validations.reduce((acc, validation) => {
			if (!acc.has(validation.mac_sam_serial_number)) acc.set(validation.mac_sam_serial_number, []);
			acc.get(validation.mac_sam_serial_number).push(validation);
			return acc;
		}, new Map<number, SimplifiedApexValidation[]>());

		for (const [samSerialNumber, validations] of groupedValidations.entries()) {
			const sortedValidations = sortByUnixTimestamp(validations, 'created_at', 'asc');
			groupedValidations.set(samSerialNumber, sortedValidations);
		}

		//
		// For each group, evaluate the interval between each validation.
		// Fail the test if at least one suspicious interval was found.

		for (const sortedValidations of groupedValidations.values()) {
			//

			let tooShortIntervalsQty = 0;
			const observedDelays: number[] = [];

			let previousValidationTimestamp = sortedValidations[0].created_at;
			for (let index = 1; index < sortedValidations.length; index++) {
				const delayInMilliseconds = sortedValidations[index].created_at - previousValidationTimestamp;
				observedDelays.push(delayInMilliseconds);
				if (delayInMilliseconds < MIN_ALLOWED_INTERVAL_MS) tooShortIntervalsQty++;
				previousValidationTimestamp = sortedValidations[index].created_at;
			}

			if (tooShortIntervalsQty > 0) {
				return {
					grade: 'fail',
					reason: 'INTERVALS_TOO_SHORT',
				};
			}

			//
		}

		//
		// Return a passing grade otherwise

		return {
			grade: 'pass',
			reason: 'EXPECTED_VALIDATION_INTERVALS',
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
