/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if there are events with excessive delay between the vehicle and PCGI.
 *
 * GRADES:
 * → PASS = Delay between Vehicle and PCGI timestamps is less than 10 seconds.
 * → FAIL = Delay between Vehicle and PCGI timestamps is equal to or higher than 10 seconds.
 */
export function expectedVehicleEventDelayAnalyzer(analysisData: AnalysisData): Ride['analysis']['EXPECTED_VEHICLE_EVENT_DELAY'] {
	try {
		//

		if (!analysisData.vehicle_events.length) {
			return {
				grade: 'fail',
				reason: 'NO_VEHICLE_EVENTS',
				value: null,
			};
		}

		//
		// Evaluate each vehicle event

		let countOfEventsWithDelay = 0;

		for (const vehicleEvent of analysisData.vehicle_events) {
			const delayInMilliseconds = vehicleEvent.received_at - vehicleEvent.created_at;
			if (delayInMilliseconds >= 10000) countOfEventsWithDelay++;
		}

		if (countOfEventsWithDelay > 0) {
			return {
				grade: 'fail',
				reason: 'UNEXPECTED_VEHICLE_EVENTS_DELAY',
				value: countOfEventsWithDelay,
			};
		}

		return {
			grade: 'pass',
			reason: `EXPECTED_VEHICLE_EVENTS_DELAY`,
			value: countOfEventsWithDelay,
		};

		//
	} catch (error) {
		return {
			error_message: error.message,
			grade: 'error',
			reason: null,
			value: null,
		};
	}
};
