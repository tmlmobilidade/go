/* * */

import { sortByTimestamp } from '@/utils/sort-by-timestamp.util.js';
import { VehicleEvent } from '@tmlmobilidade/core/types';

/**
 * Detect the last event in the vehicle events data.
 * @param vehicleEventsData
 * @returns The last event in the vehicle events data.
 */
export function detectLastEvent(vehicleEventsData: VehicleEvent[]): null | VehicleEvent {
	//

	//
	// Return null if there are no vehicle events.

	if (vehicleEventsData.length < 1) {
		// throw new Error('No vehicle events were found.');
		return null;
	}

	//
	// Sort the vehicle events by vehicle timestamp in descending order.
	// Return the first event found.

	const sortedVehicleEvents = sortByTimestamp(vehicleEventsData, 'created_at', 'desc');

	return sortedVehicleEvents[0];

	//
}
