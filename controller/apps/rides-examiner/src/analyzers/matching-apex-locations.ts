/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if there are Location Transactions for all stops of the trip.
 *
 * GRADES:
 * → PASS = At least one Location Transaction for each stop of the trip.
 * → FAIL = Missing Location Transaction for any stop of the trip.
 */
export function matchingApexLocationsAnalyzer(analysisData: AnalysisData): Ride['analysis']['MATCHING_APEX_LOCATIONS'] {
	try {
		//

		if (!analysisData.hashed_trip?.path?.length) {
			return {
				grade: 'fail',
				reason: 'NO_PATH_DATA',
			};
		}

		if (!analysisData.simplified_apex_locations.length) {
			return {
				grade: 'fail',
				reason: 'NO_APEX_LOCATIONS',
			};
		}

		// 1.
		// Initiate Sets

		const pathStopIds = new Set();
		const locationTransactionsStopIds = new Set();

		// 2.
		// Save references to all stops for each source type

		for (const pathStop of analysisData.hashed_trip.path) {
			pathStopIds.add(pathStop.stop_id);
		}

		for (const locationTransaction of analysisData.simplified_apex_locations) {
			locationTransactionsStopIds.add(locationTransaction.stop_id);
		}

		// 3.
		// Check if all locationTransactionsStopIds are available in pathStopIds

		const missingStopIds = new Set();

		for (const pathStopId of pathStopIds.values()) {
			if (!locationTransactionsStopIds.has(pathStopId)) {
				missingStopIds.add(pathStopId);
			}
		}

		// 4.
		// Assign grades to analysis

		if (missingStopIds.size > 0) {
			return {
				grade: 'fail',
				reason: 'MISSING_APEX_LOCATION_FOR_AT_LEAST_ONE_STOP',
			};
		}

		return {
			grade: 'pass',
			reason: 'MATCHING_APEX_LOCATIONS',
		};

		//
	}
	catch (error) {
		return {
			error_message: error.message,
			grade: 'error',
			reason: null,
		};
	}
};
