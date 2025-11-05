/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { detectEndEvent } from '@/utils/detect-end-event.util.js';
import { detectFirstEvent } from '@/utils/detect-first-event.util.js';
import { detectLastEvent } from '@/utils/detect-last-event.util.js';
import { detectStartEvent } from '@/utils/detect-start-event.util.js';
import { getObservedExtension } from '@/utils/get-observed-extension.util.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * Augments the ride data with additional information from the analysis data.
 * @param rideData The ride data to augment.
 * @param analysisData The analysis data containing vehicle events, APEX transactions, and other related information.
 * @returns The original Ride with augmented data.
 */
export function augmentRide(analysisData: AnalysisData): Ride {
	//

	const augmentedRide = analysisData.ride;

	//
	// Add the seen_at timestamps from the first and last events

	const detectedFirstEvent = detectFirstEvent(analysisData.vehicle_events);
	const detectedLastEvent = detectLastEvent(analysisData.vehicle_events);

	augmentedRide.seen_first_at = detectedFirstEvent?.created_at ?? null;
	augmentedRide.seen_last_at = detectedLastEvent?.created_at ?? null;

	//
	// Detect the start and end times for this Ride

	const detectedStartEvent = detectStartEvent(analysisData.vehicle_events, analysisData.hashed_trip, analysisData.hashed_shape);
	const detectedEndEvent = detectEndEvent(analysisData.vehicle_events, analysisData.hashed_shape);

	augmentedRide.start_time_observed = detectedStartEvent?.created_at ?? null;
	augmentedRide.end_time_observed = detectedEndEvent?.created_at ?? null;

	//
	// Get the observed extension from the vehicle odometer

	augmentedRide.extension_observed = getObservedExtension(detectedStartEvent, detectedEndEvent);

	//
	// Get the vehicle IDs found on the given analysis data

	const foundVehicleIds = new Set<number>();

	analysisData.vehicle_events.forEach(item => item.vehicle_id && foundVehicleIds.add(Number(item.vehicle_id)));
	analysisData.simplified_apex_locations.forEach(item => item.vehicle_id && foundVehicleIds.add(item.vehicle_id));
	analysisData.simplified_apex_validations.forEach(item => item.vehicle_id && foundVehicleIds.add(item.vehicle_id));

	augmentedRide.vehicle_ids = Array.from(foundVehicleIds);

	//
	// Get the driver IDs found on the given analysis data

	const foundDriverIds = new Set<string>();

	analysisData.vehicle_events.forEach(item => item.driver_id && foundDriverIds.add(item.driver_id));

	augmentedRide.driver_ids = Array.from(foundDriverIds);

	//
	// Add APEX transaction counters

	augmentedRide.apex_locations_qty = analysisData.simplified_apex_locations.length;

	augmentedRide.apex_on_board_refunds_qty = analysisData.simplified_apex_on_board_refunds.length;
	augmentedRide.apex_on_board_refunds_amount = analysisData.simplified_apex_on_board_refunds.reduce((acc, item) => acc + (item.price || 0), 0);

	augmentedRide.apex_on_board_sales_qty = analysisData.simplified_apex_on_board_sales.length;
	augmentedRide.apex_on_board_sales_amount = analysisData.simplified_apex_on_board_sales.reduce((acc, item) => acc + (item.price || 0), 0);

	augmentedRide.apex_validations_qty = analysisData.simplified_apex_validations.length;

	//
	// Add passenger counters from valid APEX Validations and On-Board Sales

	const validApexValidations = analysisData.simplified_apex_validations.filter(item => item.is_passenger);
	const validApexOnBoardSales = analysisData.simplified_apex_on_board_sales.filter(item => item.is_passenger);

	augmentedRide.passengers_observed = validApexValidations.length;

	augmentedRide.passengers_observed_subscription_qty = validApexValidations.filter(item => item.category === 'subscription').length;

	augmentedRide.passengers_observed_prepaid_qty = validApexValidations.filter(item => item.category === 'prepaid').length;
	augmentedRide.passengers_observed_prepaid_amount = validApexValidations.filter(item => item.category === 'prepaid').reduce((acc, item) => acc + (item.units_qty || 0), 0);

	augmentedRide.passengers_observed_on_board_sales_qty = validApexValidations.filter(item => item.category === 'on_board_sale').length;
	augmentedRide.passengers_observed_on_board_sales_amount = validApexOnBoardSales.reduce((acc, item) => acc + (item.price || 0), 0);

	//
	// Return the augmented Ride to the caller

	return augmentedRide;

	//
}
