/* * */

import { type AnalysisData } from '@/types/analysis-data.type.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if the trip has at most two vehicle IDs (at least one, maximum of two).
 *
 * GRADES:
 * → PASS = At least one Vehicle, and maximum two Vehicle IDs for the trip.
 * → FAIL = No Vehicle or more than two Vehicle IDs for the trip.
 */
export function atMostTwoVehicleIdsAnalyzer(analysisData: AnalysisData): Ride['analysis']['AT_MOST_TWO_VEHICLE_IDS'] {
	try {
		//

		if (analysisData.ride.vehicle_ids.length === 0) {
			return {
				grade: 'fail',
				message: 'No Vehicle IDs found for this trip.',
				reason: 'NO_VEHICLE_ID_FOUND',
				value: 0,
			};
		}

		if (analysisData.ride.vehicle_ids.length > 2) {
			return {
				grade: 'fail',
				message: `Found ${analysisData.ride.vehicle_ids.length} Vehicle IDs for this trip.`,
				reason: 'FOUND_MORE_THAN_2_VEHICLE_IDS',
				value: analysisData.ride.vehicle_ids.length,
			};
		}

		return {
			grade: 'pass',
			message: `Found ${analysisData.ride.vehicle_ids.length} Vehicle IDs for this trip.`,
			reason: 'FOUND_ONE_OR_TWO_VEHICLE_IDS',
			value: analysisData.ride.vehicle_ids.length,
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
