/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if there are Location Transactions for all stops of the trip.
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

		//
		// Initiate Sets

		const pathStopIds = new Set<string>();
		const existingSamSerialNumbers = new Set<number>();

		//
		// Save references for each data type

		for (const pathStop of analysisData.hashed_trip.path) {
			pathStopIds.add(pathStop.stop_id);
		}

		for (const locationTransaction of analysisData.simplified_apex_locations) {
			existingSamSerialNumbers.add(locationTransaction.mac_sam_serial_number);
		}

		//
		// For each SAM Serial Number found,
		// check if all locationTransactionsStopIds are available in pathStopIds

		let allStopsFoundInLocations = false;

		for (const samSerialNumber of existingSamSerialNumbers.values()) {
			// Get all location transactions for this SAM Serial Number
			const locationTransactionsForSam = analysisData.simplified_apex_locations.filter(doc => doc.mac_sam_serial_number === samSerialNumber);
			// Check if every stop in the path is represented in the location transactions
			allStopsFoundInLocations = Array.from(pathStopIds).every(stopId => locationTransactionsForSam.some(doc => doc.stop_id === stopId));
		}

		//
		// Assign grades to analysis

		if (!allStopsFoundInLocations) {
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
	} catch (error) {
		return {
			error_message: error.message,
			grade: 'error',
			reason: null,
		};
	}
};
