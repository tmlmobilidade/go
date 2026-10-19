/* * */

import { type PickedSimplifiedVehicleEvent } from '../types/analysis-data.js';

/**
 * Detect the first event in the vehicle events data.
 * @param vehicleEventsData The vehicle events data.
 * @returns The first event in the vehicle events data.
 */
export function detectFirstEvent(vehicleEventsData: PickedSimplifiedVehicleEvent[]): null | PickedSimplifiedVehicleEvent {
	//

	//
	// Return null if there are no vehicle events.

	if (vehicleEventsData.length < 1) return null;

	//
	// Sort the vehicle events by vehicle timestamp in ascending order.
	// Return the first event found.

	const sortedVehicleEvents = vehicleEventsData.sort((a, b) => a.created_at - b.created_at);

	return sortedVehicleEvents[0];
}
