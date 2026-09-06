/* * */

import { type PickedSimplifiedVehicleEvent } from '../types/analysis-data.js';

/**
 * The observed extension is the distance between the odomoter values of the first and last events.
 * @param startEvent The detected vehicle event that represents the start of the ride.
 * @param endEvent The detected vehicle event that represents the end of the ride.
 * @returns The observed extension in meters, measured by the odometer value of each vehicle event
 */
export function getObservedExtension(startEvent: null | PickedSimplifiedVehicleEvent, endEvent: null | PickedSimplifiedVehicleEvent): null | number {
	//

	if (!startEvent?.odometer) return null;

	if (!endEvent?.odometer) return null;

	const observedExtension = endEvent.odometer - startEvent.odometer;

	if (observedExtension < 0) return null;

	return observedExtension;
}
