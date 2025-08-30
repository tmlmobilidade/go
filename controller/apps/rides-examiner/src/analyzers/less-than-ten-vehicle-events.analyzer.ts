/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if at the trip has less than ten Vehicle Events.
 *
 * GRADES:
 * → PASS = More than ten Vehicle Events found for the trip.
 * → FAIL = Less than or equal to ten Vehicle Events found for the trip.
 */
export function lessThanTenVehicleEventsAnalyzer(analysisData: AnalysisData): Ride['analysis']['LESS_THAN_TEN_VEHICLE_EVENTS'] {
	try {
		//

		// 1.
		// Test if the trip has more than ten Vehicle Events

		if (analysisData.vehicle_events.length > 10) {
			return {
				grade: 'pass',
				message: `Found ${analysisData.vehicle_events.length} Vehicle Events for this trip.`,
				reason: 'FOUND_MORE_THAN_10_VEHICLE_EVENTS',
				value: analysisData.vehicle_events.length,
			};
		}

		if (analysisData.vehicle_events.length === 1) {
			return {
				grade: 'fail',
				message: `Found ${analysisData.vehicle_events.length} Vehicle Events for this trip.`,
				reason: 'FOUND_ONLY_1_VEHICLE_EVENT',
				value: analysisData.vehicle_events.length,
			};
		}

		return {
			grade: 'fail',
			message: `Found ${analysisData.vehicle_events.length} Vehicle Events for this trip.`,
			reason: 'FOUND_LESS_THAN_10_VEHICLE_EVENTS',
			value: analysisData.vehicle_events.length,
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
