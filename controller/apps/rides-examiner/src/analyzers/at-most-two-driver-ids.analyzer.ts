/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if the trip has at most two drivers (at least one, maximum of two).
 *
 * GRADES:
 * → PASS = At least one Driver, and maximum two Driver IDs for the trip.
 * → FAIL = No Driver or more than two Drivers IDs for the trip.
 */
export function atMostTwoDriverIdsAnalyzer(analysisData: AnalysisData): Ride['analysis']['AT_MOST_TWO_DRIVER_IDS'] {
	try {
		//

		if (analysisData.ride.driver_ids.length === 0) {
			return {
				grade: 'fail',
				message: 'No Driver IDs found for this trip.',
				reason: 'NO_DRIVER_ID_FOUND',
				value: 0,
			};
		}

		if (analysisData.ride.driver_ids.length > 2) {
			return {
				grade: 'fail',
				message: `Found ${analysisData.ride.driver_ids.length} Driver IDs for this trip.`,
				reason: 'FOUND_MORE_THAN_2_DRIVER_IDS',
				value: analysisData.ride.driver_ids.length,
			};
		}

		return {
			grade: 'pass',
			message: `Found ${analysisData.ride.driver_ids.length} Driver IDs for this trip.`,
			reason: 'FOUND_ONE_OR_TWO_DRIVER_IDS',
			value: analysisData.ride.driver_ids.length,
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
