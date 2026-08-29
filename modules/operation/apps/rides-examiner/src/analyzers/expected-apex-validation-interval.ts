/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { type RideAnalysisExpectedApexValidationInterval, RideAnalysisExpectedApexValidationIntervalSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

const MIN_ALLOWED_INTERVAL_MS = 1_000; // 1 second

/**
 * This analyzer tests if the interval between validations is normal or not.
 * GRADES:
 * → PASS = Interval between Validation transactions is greater than or equal to 3 seconds.
 * → FAIL = Interval between Validation transactions is less than 3 seconds.
 */
export function expectedApexValidationIntervalAnalyzer(analysisData: AnalysisData): RideAnalysisExpectedApexValidationInterval {
	try {
		//

		//
		// Skip if there are not enough APEX Validations

		if (!analysisData.apex_validations.length) {
			return RideAnalysisExpectedApexValidationIntervalSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'skip',
				observed_average_interval: null,
				observed_max_interval: null,
				observed_min_interval: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_APEX_VALIDATIONS',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_milliseconds,
			});
		}

		if (analysisData.apex_validations.length < 2) {
			return RideAnalysisExpectedApexValidationIntervalSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'skip',
				observed_average_interval: null,
				observed_max_interval: null,
				observed_min_interval: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NOT_ENOUGH_VALIDATIONS',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_milliseconds,
			});
		}

		//
		// Group validations by SAM Serial Number
		// and sort them by created_at timestamp

		const validationsBySamSerialNumber: Record<number, SimplifiedApexValidation[]> = {};

		for (const validation of analysisData.apex_validations) {
			// Skip if the SAM Serial Number is not available
			if (!validation.mac_sam_serial_number) continue;
			// Initialize the array if it doesn't exist
			if (!validationsBySamSerialNumber[validation.mac_sam_serial_number]) validationsBySamSerialNumber[validation.mac_sam_serial_number] = [];
			// Add the validation to the corresponding array
			validationsBySamSerialNumber[validation.mac_sam_serial_number].push(validation);
		}

		for (const [samSerialNumber, validations] of Object.entries(validationsBySamSerialNumber)) {
			const sortedValidations = validations.sort((a, b) => a.created_at - b.created_at);
			validationsBySamSerialNumber[samSerialNumber] = sortedValidations;
		}

		//
		// For each group, evaluate the interval between each validation.
		// Fail the test if at least one suspicious interval was found.

		let tooShortIntervalsQty = 0;

		const observedDelays: Record<number, number[]> = {};

		for (const [samSerialNumber, validations] of Object.entries(validationsBySamSerialNumber)) {
			// Initialize the previous validation timestamp
			let previousValidationTimestamp = validations[0].created_at;
			// Loop through the validations and calculate the delay between each validation
			for (let index = 1; index < validations.length; index++) {
				// Calculate the delay between the current and previous validation
				const delayInMilliseconds = validations[index].created_at - previousValidationTimestamp;
				// Add the delay to the corresponding SAM Serial Number
				if (!observedDelays[samSerialNumber]) observedDelays[samSerialNumber] = [];
				observedDelays[samSerialNumber].push(delayInMilliseconds);
				// Check if the delay is less than the minimum allowed interval
				if (delayInMilliseconds < MIN_ALLOWED_INTERVAL_MS) tooShortIntervalsQty++;
				// Update the previous validation timestamp
				previousValidationTimestamp = validations[index].created_at;
			}
		}

		//
		// Calculate the average, max, and min delay found for this analysis

		const observedAverageInterval = Object.values(observedDelays).reduce((acc, delays) => acc + delays.reduce((acc, delay) => acc + delay, 0) / delays.length, 0);
		const observedMaxInterval = Object.values(observedDelays).reduce((_, delays) => Math.max(...delays), 0);
		const observedMinInterval = Object.values(observedDelays).reduce((_, delays) => Math.min(...delays), 0);

		//
		// Fail the test if too short intervals were found

		if (tooShortIntervalsQty > 0) {
			return RideAnalysisExpectedApexValidationIntervalSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'fail',
				observed_average_interval: observedAverageInterval,
				observed_max_interval: observedMaxInterval,
				observed_min_interval: observedMinInterval,
				operational_date: analysisData.ride.operational_date,
				reason: 'INTERVALS_TOO_SHORT',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_milliseconds,
			});
		}

		//
		// Return a passing grade otherwise

		return RideAnalysisExpectedApexValidationIntervalSchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'pass',
			observed_average_interval: observedAverageInterval,
			observed_max_interval: observedMaxInterval,
			observed_min_interval: observedMinInterval,
			operational_date: analysisData.ride.operational_date,
			reason: 'EXPECTED_VALIDATION_INTERVALS',
			remarks: null,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_milliseconds,
		});

		//
	} catch (error) {
		return RideAnalysisExpectedApexValidationIntervalSchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'error',
			observed_average_interval: null,
			observed_max_interval: null,
			observed_min_interval: null,
			operational_date: analysisData.ride.operational_date,
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_milliseconds,
		});
	}
};
