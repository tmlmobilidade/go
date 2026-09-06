/* * */

import { RideAnalysisMatchingVehicleIds, RideAnalysisMatchingVehicleIdsSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

import { type AnalysisData } from '../types/analysis-data.js';

/**
 * This analyzer checks if the Vehicle IDs of APEX transactions match the Vehicle Events.
 * GRADES:
 * → PASS = At least one Vehicle, and maximum two Vehicle IDs for the trip.
 * → FAIL = No Vehicle or more than two Vehicles IDs for the trip.
 */
export function matchingVehicleIdsAnalyzer(analysisData: AnalysisData): RideAnalysisMatchingVehicleIds {
	try {
		//

		const noTransactionsWithVehicleIdsFound =
			!analysisData.apex_banking_taps.length
			&& !analysisData.apex_locations.length
			&& !analysisData.apex_validations.length;

		if (noTransactionsWithVehicleIdsFound) {
			return RideAnalysisMatchingVehicleIdsSchema.parse({
				agency_id: analysisData.ride.agency_id,
				extra_apex_vehicle_ids_qty: null,
				extra_vehicle_events_vehicle_ids_qty: null,
				grade_status: 'skip',
				matching_vehicle_ids_qty: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_APEX_TRANSACTIONS',
				remarks: null,
				ride_id: analysisData.ride._id,
				total_vehicle_ids_qty: null,
				updated_at: Dates.now('utc').unix_milliseconds,
			});
		}

		if (!analysisData.vehicle_events.length) {
			return RideAnalysisMatchingVehicleIdsSchema.parse({
				agency_id: analysisData.ride.agency_id,
				extra_apex_vehicle_ids_qty: null,
				extra_vehicle_events_vehicle_ids_qty: null,
				grade_status: 'skip',
				matching_vehicle_ids_qty: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_VEHICLE_EVENTS',
				remarks: null,
				ride_id: analysisData.ride._id,
				total_vehicle_ids_qty: null,
				updated_at: Dates.now('utc').unix_milliseconds,
			});
		}

		//
		// Get all unique Vehicle IDs from Apex Transactions and Vehicle Events

		const uniqueIdsFromApexBankingTaps = new Set(analysisData.apex_banking_taps.map(item => String(item.vehicle_id)));
		const uniqueIdsFromApexLocations = new Set(analysisData.apex_locations.map(item => String(item.vehicle_id)));
		const uniqueIdsFromApexValidations = new Set(analysisData.apex_validations.map(item => String(item.vehicle_id)));
		const uniqueIdsFromVehicleEvents = new Set(analysisData.vehicle_events.map(item => String(item.vehicle_id)));

		//
		// Combine all IDs and check if the size of the
		// final set matches the size of the individual sets

		const uniqueApexVehicleIds = new Set([
			...uniqueIdsFromApexBankingTaps.values(),
			...uniqueIdsFromApexLocations.values(),
			...uniqueIdsFromApexValidations.values(),
		]);

		const combinedUniqueVehicleIds = new Set([
			...uniqueApexVehicleIds.values(),
			...uniqueIdsFromVehicleEvents.values(),
		]);

		const extraApexVehicleIds = Array.from(uniqueApexVehicleIds).filter(id => !combinedUniqueVehicleIds.has(id));
		const extraVehicleEventsVehicleIds = Array.from(uniqueIdsFromVehicleEvents).filter(id => !combinedUniqueVehicleIds.has(id));
		const matchingVehicleIds = Array.from(combinedUniqueVehicleIds).filter(id => uniqueApexVehicleIds.has(id) && uniqueIdsFromVehicleEvents.has(id));

		if (extraApexVehicleIds.length > 0 || extraVehicleEventsVehicleIds.length > 0) {
			return RideAnalysisMatchingVehicleIdsSchema.parse({
				agency_id: analysisData.ride.agency_id,
				extra_apex_vehicle_ids_qty: extraApexVehicleIds.length,
				extra_vehicle_events_vehicle_ids_qty: extraVehicleEventsVehicleIds.length,
				grade_status: 'fail',
				matching_vehicle_ids_qty: matchingVehicleIds.length,
				operational_date: analysisData.ride.operational_date,
				reason: 'VEHICLE_ID_MISMATCH',
				remarks: null,
				ride_id: analysisData.ride._id,
				total_vehicle_ids_qty: combinedUniqueVehicleIds.size,
				updated_at: Dates.now('utc').unix_milliseconds,
			});
		}

		//
		// If we reach this point,
		// it means we have a matching set of Vehicle IDs

		return RideAnalysisMatchingVehicleIdsSchema.parse({
			agency_id: analysisData.ride.agency_id,
			extra_apex_vehicle_ids_qty: extraApexVehicleIds.length,
			extra_vehicle_events_vehicle_ids_qty: extraVehicleEventsVehicleIds.length,
			grade_status: 'pass',
			matching_vehicle_ids_qty: matchingVehicleIds.length,
			operational_date: analysisData.ride.operational_date,
			reason: 'MATCHING_VEHICLE_IDS',
			remarks: null,
			ride_id: analysisData.ride._id,
			total_vehicle_ids_qty: combinedUniqueVehicleIds.size,
			updated_at: Dates.now('utc').unix_milliseconds,
		});

		//
	} catch (error) {
		return RideAnalysisMatchingVehicleIdsSchema.parse({
			agency_id: analysisData.ride.agency_id,
			extra_apex_vehicle_ids_qty: null,
			extra_vehicle_events_vehicle_ids_qty: null,
			grade_status: 'error',
			matching_vehicle_ids_qty: null,
			operational_date: analysisData.ride.operational_date,
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			total_vehicle_ids_qty: null,
			updated_at: Dates.now('utc').unix_milliseconds,
		});
	}
};
