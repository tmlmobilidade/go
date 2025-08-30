/* * */

import { type AnalysisData } from '@/types/analysis-data.type.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer checks if the Vehicle IDs of APEX transactions match the Vehicle Events.
 * GRADES:
 * → PASS = At least one Vehicle, and maximum two Vehicle IDs for the trip.
 * → FAIL = No Vehicle or more than two Vehicles IDs for the trip.
 */
export function matchingVehicleIdsAnalyzer(analysisData: AnalysisData): Ride['analysis']['MATCHING_VEHICLE_IDS'] {
	try {
		//

		if (!analysisData.simplified_apex_validations.length && !analysisData.simplified_apex_locations.length) {
			return {
				grade: 'skip',
				reason: 'NO_APEX_TRANSACTIONS_FOUND',
			};
		}

		if (!analysisData.vehicle_events.length) {
			return {
				grade: 'skip',
				reason: 'NO_VEHICLE_EVENTS_FOUND',
			};
		}

		//
		// Get all unique Vehicle IDs from Apex Transactions and Vehicle Events

		const uniqueIdsFromApexLocations = new Set(analysisData.simplified_apex_locations.map(item => item.vehicle_id));
		const uniqueIdsFromApexValidations = new Set(analysisData.simplified_apex_validations.map(item => item.vehicle_id));
		const uniqueIdsFromVehicleEvents = new Set(analysisData.vehicle_events.map(item => item.vehicle_id));

		//
		// Combine all IDs and check if the size of the
		// final set matches the size of the individual sets

		const combinedUniqueVehicleIds = new Set([
			...uniqueIdsFromApexLocations.values(),
			...uniqueIdsFromApexValidations.values(),
			...uniqueIdsFromVehicleEvents.values(),
		]);

		const mismatchApexLocations = combinedUniqueVehicleIds.size !== uniqueIdsFromApexLocations.size;
		const mismatchApexValidations = combinedUniqueVehicleIds.size !== uniqueIdsFromApexValidations.size;
		const mismatchVehicleEvents = combinedUniqueVehicleIds.size !== uniqueIdsFromVehicleEvents.size;

		if (mismatchApexLocations || mismatchApexValidations || mismatchVehicleEvents) {
			return {
				grade: 'fail',
				reason: 'VEHICLE_ID_MISMATCH',
			};
		}

		//
		// If we reach this point,
		// it means we have a matching set of Vehicle IDs

		return {
			grade: 'pass',
			reason: 'MATCHING_VEHICLE_IDS',
		};

		//
	}
	catch (error) {
		console.log('matchingVehicleIdsAnalyzer():', error.message);
		return {
			grade: 'error',
			reason: null,
		};
	}
};
