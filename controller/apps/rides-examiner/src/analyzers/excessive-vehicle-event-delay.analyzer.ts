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
export function excessiveVehicleEventDelayAnalyzer(analysisData: AnalysisData): Ride['analysis']['EXCESSIVE_VEHICLE_EVENT_DELAY'] {
	try {
		//

		// 1.
		// Initiate a counting variable

		let countOfEventsWithDelay = 0;

		// 2.
		// Evaluate each vehicle event

		for (const vehicleEvent of analysisData.vehicle_events) {
			//
			const delayInMilliseconds = vehicleEvent.received_at - vehicleEvent.created_at;
			//
			if (delayInMilliseconds >= 10000) {
				countOfEventsWithDelay++;
			}
			//
		}

		if (countOfEventsWithDelay === 0) {
			return {
				grade: 'pass',
				message: 'All vehicle events are within delay limits.',
				reason: 'ALL_VEHICLE_EVENTS_ARE_WITHIN_DELAY_LIMITS',
				value: 0,
			};
		}

		return {
			grade: 'fail',
			message: `Found ${countOfEventsWithDelay} vehicle events with excessive delay.`,
			reason: `THERE_ARE_VEHICLE_EVENTS_WITH_EXCESSIVE_DELAY`,
			value: countOfEventsWithDelay,
		};

		//
	}
	catch (error) {
		return {
			grade: 'error',
			message: error.message,
			reason: null,
			value: null,
		};
	}
};
