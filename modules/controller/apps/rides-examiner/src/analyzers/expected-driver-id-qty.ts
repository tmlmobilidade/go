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
export function expectedDriverIdQtyAnalyzer(analysisData: AnalysisData): Ride['analysis']['EXPECTED_DRIVER_ID_QTY'] {
	try {
		//

		if (!analysisData.vehicle_events.length) {
			return {
				grade: 'fail',
				reason: 'NO_VEHICLE_EVENTS',
				value: null,
			};
		}

		if (analysisData.ride.driver_ids.length > 2) {
			return {
				grade: 'fail',
				reason: 'UNEXPECTED_DRIVER_ID_QTY',
				value: analysisData.ride.driver_ids.length,
			};
		}

		return {
			grade: 'pass',
			reason: 'EXPECTED_DRIVER_ID_QTY',
			value: analysisData.ride.driver_ids.length,
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
