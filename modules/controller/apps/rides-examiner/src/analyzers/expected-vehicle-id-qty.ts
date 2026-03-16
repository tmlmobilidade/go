/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if the trip has at most two vehicle IDs (at least one, maximum of two).
 *
 * GRADES:
 * → PASS = At least one Vehicle, and maximum two Vehicle IDs for the trip.
 * → FAIL = No Vehicle or more than two Vehicle IDs for the trip.
 */
export function expectedVehicleIdQtyAnalyzer(analysisData: AnalysisData): Ride['analysis']['EXPECTED_VEHICLE_ID_QTY'] {
	try {
		//

		if (!analysisData.vehicle_events.length) {
			return {
				grade: 'fail',
				reason: 'NO_VEHICLE_EVENTS',
				value: null,
			};
		}

		if (analysisData.ride.vehicle_ids.length > 2) {
			return {
				grade: 'fail',
				reason: 'UNEXPECTED_VEHICLE_ID_QTY',
				value: analysisData.ride.vehicle_ids.length,
			};
		}

		return {
			grade: 'pass',
			reason: 'EXPECTED_VEHICLE_ID_QTY',
			value: analysisData.ride.vehicle_ids.length,
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
