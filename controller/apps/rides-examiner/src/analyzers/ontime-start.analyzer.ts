/* * */

import { type AnalysisData } from '@/types/analysis-data.type.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if there is an excess delay starting the trip using geographic data.
 * It uses the timestamp of the first event that is outside the geofence
 * of the first stop of the trip to determine the trip start time.
 *
 * GRADES:
 * → PASS = Ride start time delay is less than or equal to five minutes.
 * → FAIL = Ride start time delay is greater than five minutes.
 */
export function ontimeStartAnalyzer(analysisData: AnalysisData): Ride['analysis']['ONTIME_START'] {
	try {
		//

		//
		// Validate that the test has the necessary data

		if (!analysisData.ride.start_time_scheduled) {
			return {
				grade: 'fail',
				message: 'Ride has no scheduled start_time.',
				reason: 'NO_SCHEDULED_START_TIME',
				value: null,
			};
		}

		if (!analysisData.ride.start_time_observed) {
			return {
				grade: 'fail',
				message: 'Ride has no observed start_time.',
				reason: 'NO_OBSERVED_START_TIME',
				value: null,
			};
		}

		//
		// Calculate the delay in minutes

		const delayInMinutes = (analysisData.ride.start_time_observed - analysisData.ride.start_time_scheduled) / 1000 / 60;

		//
		// Classify the delay

		if (delayInMinutes < 0) {
			return {
				grade: 'fail',
				message: `Ride started ${delayInMinutes} minutes early.`,
				reason: 'RIDE_STARTED_EARLY',
				value: delayInMinutes,
			};
		}

		if (delayInMinutes >= 0 && delayInMinutes <= 5) {
			return {
				grade: 'pass',
				message: `Ride started ${delayInMinutes} minutes late.`,
				reason: 'RIDE_STARTED_ZERO_TO_FIVE_MINUTES_LATE',
				value: delayInMinutes,
			};
		}

		if (delayInMinutes > 5) {
			return {
				grade: 'fail',
				message: `Ride started ${delayInMinutes} minutes late.`,
				reason: 'RIDE_STARTED_MORE_THAN_FIVE_MINUTES_LATE',
				value: delayInMinutes,
			};
		}

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
