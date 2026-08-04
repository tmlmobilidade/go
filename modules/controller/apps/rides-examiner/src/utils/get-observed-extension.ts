/* * */

import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/**
 * The observed extension is the distance between the odomoter values of the first and last events.
 * @param startEvent The detected vehicle event that represents the start of the ride.
 * @param endEvent The detected vehicle event that represents the end of the ride.
 * @returns The observed extension in meters, measured by the odometer value of each vehicle event
 */
export function getObservedExtension(startEvent: SimplifiedVehicleEvent, endEvent: SimplifiedVehicleEvent): null | number {
	//

	if (!startEvent?.odometer) return null;

	if (!endEvent?.odometer) return null;

	const observedExtension = endEvent.odometer - startEvent.odometer;

	if (observedExtension < 0) return null;

	return observedExtension;
}
