/* * */

import { type PickedSimplifiedVehicleEvent } from '../types/analysis-data.js';

/**
 * Detect the last event in the vehicle events data.
 * @param vehicleEventsData The vehicle events data.
 * @returns The last event in the vehicle events data.
 */
export function detectLastEvent(vehicleEventsData: PickedSimplifiedVehicleEvent[]): null | PickedSimplifiedVehicleEvent {
	//

	//
	// Return null if there are no vehicle events.

	if (vehicleEventsData.length < 1) return null;

	//
	// Sort the vehicle events by vehicle timestamp in descending order.
	// Return the first event found.

	const sortedVehicleEvents = vehicleEventsData.sort((a, b) => b.created_at - a.created_at);

	return sortedVehicleEvents[0];
}
