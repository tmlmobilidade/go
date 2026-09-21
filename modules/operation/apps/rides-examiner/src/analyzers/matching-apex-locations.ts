/* * */

import { type RideAnalysisMatchingApexLocations, RideAnalysisMatchingApexLocationsSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

import { type AnalysisData } from '../types/analysis-data.js';

/**
 * This analyzer tests if there are Location Transactions for all stops of the trip.
 * GRADES:
 * → PASS = At least one Location Transaction for each stop of the trip.
 * → FAIL = Missing Location Transaction for any stop of the trip.
 */
export function matchingApexLocationsAnalyzer(analysisData: AnalysisData): RideAnalysisMatchingApexLocations {
	try {
		//

		if (!analysisData.hashed_trip.length) {
			return RideAnalysisMatchingApexLocationsSchema.parse({
				agency_id: analysisData.ride.agency_id,
				expected_apex_locations_qty: null,
				grade_status: 'skip',
				matching_apex_locations_qty: null,
				missing_apex_locations_qty: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_PATH_DATA',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_milliseconds,
			});
		}

		if (!analysisData.apex_locations.length) {
			return RideAnalysisMatchingApexLocationsSchema.parse({
				agency_id: analysisData.ride.agency_id,
				expected_apex_locations_qty: null,
				grade_status: 'skip',
				matching_apex_locations_qty: null,
				missing_apex_locations_qty: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_APEX_LOCATIONS',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_milliseconds,
			});
		}

		//
		// Get unique stop IDs from path

		const distinctStopIds = Array.from(new Set(analysisData.hashed_trip.map(stop => stop.stop_id)));

		//
		// Group locations by SAM Serial Number
		// and sort them by created_at timestamp

		const stopIdsBySamSerialNumber: Record<number, Set<string>> = {};

		for (const apexLocation of analysisData.apex_locations) {
			// Skip if the SAM Serial Number is not available
			if (!apexLocation.mac_sam_serial_number) continue;
			// Initialize the array if it doesn't exist
			if (!stopIdsBySamSerialNumber[apexLocation.mac_sam_serial_number]) stopIdsBySamSerialNumber[apexLocation.mac_sam_serial_number] = new Set();
			// Add the location to the corresponding array
			stopIdsBySamSerialNumber[apexLocation.mac_sam_serial_number].add(apexLocation.stop_id);
		}

		//
		// Check if all stop IDs are present in each
		// group of locations by SAM Serial Number

		let allStopsFoundInApexLocations = false;

		let missingStopIdsQty = 0;
		let matchingStopIdsQty = 0;

		for (const stopIdSet of Object.values(stopIdsBySamSerialNumber)) {
			allStopsFoundInApexLocations = distinctStopIds.every((stopId) => {
				const isMatching = stopIdSet.has(stopId);
				if (isMatching) matchingStopIdsQty++;
				else missingStopIdsQty++;
				return isMatching;
			});
		}

		//
		// Assign grades to analysis

		if (!allStopsFoundInApexLocations) {
			return RideAnalysisMatchingApexLocationsSchema.parse({
				agency_id: analysisData.ride.agency_id,
				expected_apex_locations_qty: distinctStopIds.length,
				grade_status: 'fail',
				matching_apex_locations_qty: matchingStopIdsQty,
				missing_apex_locations_qty: missingStopIdsQty,
				operational_date: analysisData.ride.operational_date,
				reason: 'MISSING_APEX_LOCATION_FOR_AT_LEAST_ONE_STOP',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_milliseconds,
			});
		}

		return RideAnalysisMatchingApexLocationsSchema.parse({
			agency_id: analysisData.ride.agency_id,
			expected_apex_locations_qty: null,
			grade_status: 'pass',
			matching_apex_locations_qty: matchingStopIdsQty,
			missing_apex_locations_qty: missingStopIdsQty,
			operational_date: analysisData.ride.operational_date,
			reason: 'MATCHING_APEX_LOCATIONS',
			remarks: null,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_milliseconds,
		});

		//
	} catch (error) {
		return RideAnalysisMatchingApexLocationsSchema.parse({
			agency_id: analysisData.ride.agency_id,
			expected_apex_locations_qty: null,
			grade_status: 'error',
			matching_apex_locations_qty: null,
			missing_apex_locations_qty: null,
			operational_date: analysisData.ride.operational_date,
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_milliseconds,
		});
	}
};
