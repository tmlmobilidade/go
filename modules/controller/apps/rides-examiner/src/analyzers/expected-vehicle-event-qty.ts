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
export function expectedVehicleEventQtyAnalyzer(analysisData: AnalysisData): Ride['analysis']['EXPECTED_VEHICLE_EVENT_QTY'] {
	try {
		//

		if (!analysisData.hashed_trip?.path) {
			return {
				expected_qty: null,
				found_qty: null,
				grade: 'skip',
				reason: 'NO_PATH_DATA',
			};
		}

		if (!analysisData.vehicle_events.length) {
			return {
				expected_qty: null,
				found_qty: null,
				grade: 'fail',
				reason: 'NO_VEHICLE_EVENTS',
			};
		}

		//
		// Get expected Vehicle Event quantity

		const expectedQty = analysisData.hashed_trip.path.length * 2;

		if (analysisData.vehicle_events.length > expectedQty) {
			return {
				expected_qty: expectedQty,
				found_qty: analysisData.vehicle_events.length,
				grade: 'pass',
				reason: 'EXPECTED_VEHICLE_EVENT_QTY',
			};
		}

		return {
			expected_qty: expectedQty,
			found_qty: analysisData.vehicle_events.length,
			grade: 'fail',
			reason: 'UNEXPECTED_VEHICLE_EVENT_QTY',
		};

		//
	} catch (error) {
		return {
			error_message: error.message,
			expected_qty: null,
			found_qty: null,
			grade: 'error',
			reason: null,
		};
	}
};
