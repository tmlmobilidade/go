/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
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
export function expectedStartTimeAnalyzer(analysisData: AnalysisData): Ride['analysis']['EXPECTED_START_TIME'] {
	try {
		//

		//
		// Validate that the test has the necessary data

		if (!analysisData.ride.start_time_scheduled) {
			return {
				grade: 'skip',
				reason: 'NO_START_TIME_SCHEDULED',
				value: null,
			};
		}

		if (!analysisData.vehicle_events.length) {
			return {
				grade: 'fail',
				reason: 'NO_VEHICLE_EVENTS',
				value: null,
			};
		}

		if (!analysisData.ride.start_time_observed) {
			return {
				grade: 'skip',
				reason: 'UNKNOWN_START',
				value: null,
			};
		}

		//
		// Calculate the delay in minutes

		const delayInMinutes = (analysisData.ride.start_time_observed - analysisData.ride.start_time_scheduled) / 1000 / 60;

		//
		// Classify the delay

		if (delayInMinutes <= -1) {
			return {
				grade: 'fail',
				reason: 'EARLY_START',
				value: delayInMinutes,
			};
		}

		if (delayInMinutes > -1 && delayInMinutes <= 5) {
			return {
				grade: 'pass',
				reason: 'START_ON_TIME',
				value: delayInMinutes,
			};
		}

		if (delayInMinutes > 5) {
			return {
				grade: 'fail',
				reason: 'LATE_START',
				value: delayInMinutes,
			};
		}

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
