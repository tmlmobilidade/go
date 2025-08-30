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
export function matchingLocationTransactionsAnalyzer(analysisData: AnalysisData): Ride['analysis']['MATCHING_LOCATION_TRANSACTIONS'] {
	try {
		//

		if (!analysisData.hashed_trip?.path) {
			return {
				grade: 'fail',
				message: 'No trip path data available.',
				reason: 'NO_PATH_DATA',
				value: null,
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
				message: `At least one Stop ID was not found in Location Transactions. Missing Stop IDs: [${Array.from(missingStopIds).join('|')}]`,
				reason: 'MISSING_LOCATION_TRANSACTION_FOR_AT_LEAST_ONE_STOP',
				value: null,
			};
		}

		return {
			grade: 'pass',
			message: `Found ${locationTransactionsStopIds.size} Location Transactions for ${pathStopIds.size} Stop IDs.`,
			reason: 'ALL_STOPS_HAVE_LOCATION_TRANSACTIONS',
			value: null,
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
