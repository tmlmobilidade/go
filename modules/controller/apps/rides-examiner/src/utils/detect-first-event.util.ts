/* * */

import { sortByUnixTimestamp } from '@tmlmobilidade/dates';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/**
 * Detect the first event in the vehicle events data.
 * @param vehicleEventsData
 * @returns The first event in the vehicle events data.
 */
export function detectFirstEvent(vehicleEventsData: SimplifiedVehicleEvent[]): null | SimplifiedVehicleEvent {
	//

	//
	// Return null if there are no vehicle events.

	if (vehicleEventsData.length < 1) {
		// throw new Error('No vehicle events were found.');
		return null;
	}

	//
	// Sort the vehicle events by vehicle timestamp in ascending order.
	// Return the first event found.

	const sortedVehicleEvents = sortByUnixTimestamp(vehicleEventsData, 'created_at', 'asc');

	return sortedVehicleEvents[0];

	//
}
