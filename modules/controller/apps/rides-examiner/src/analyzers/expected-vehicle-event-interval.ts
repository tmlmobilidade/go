/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { sortByUnixTimestamp } from '@tmlmobilidade/dates';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if the average interval between vehicle events is within limits.
 *
 * GRADES:
 * → PASS = Average interval between Vehicle events is less than or equal to 20 seconds.
 * → FAIL = Average interval between Vehicle events is higher than 20 seconds.
 */
export function expectedVehicleEventIntervalAnalyzer(analysisData: AnalysisData): Ride['analysis']['EXPECTED_VEHICLE_EVENT_INTERVAL'] {
	try {
		//

		//
		// Return a fail grade if there are no vehicle events

		if (!analysisData.vehicle_events.length) {
			return {
				grade: 'skip',
				reason: 'NO_VEHICLE_EVENTS',
				value: null,
			};
		}

		//
		// Sort vehicle events by created_at timestamp

		const sortedVehicleEvents = sortByUnixTimestamp(analysisData.vehicle_events, 'created_at', 'asc');

		//
		// Evaluate each vehicle event

		let totalIntervalBetweenEvents = 0;

		let previousEventTimestamp = sortedVehicleEvents[0].created_at;

		for (let index = 1; index < sortedVehicleEvents.length; index++) {
			const delayInSeconds = sortedVehicleEvents[index].created_at - previousEventTimestamp;
			totalIntervalBetweenEvents += delayInSeconds;
			previousEventTimestamp = sortedVehicleEvents[index].created_at;
		}

		//
		// Calculate the average interval between vehicle events

		const avgIntervalBetweenEvents = totalIntervalBetweenEvents / analysisData.vehicle_events.length;

		if (avgIntervalBetweenEvents <= 20000) {
			return {
				grade: 'pass',
				reason: 'EXPECTED_VEHICLE_EVENT_INTERVAL',
				value: avgIntervalBetweenEvents,
			};
		}

		return {
			grade: 'fail',
			reason: 'UNEXPECTED_VEHICLE_EVENT_INTERVAL',
			value: avgIntervalBetweenEvents,
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
