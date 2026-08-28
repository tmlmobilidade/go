/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type RideAnalysisExpectedVehicleEventInterval, RideAnalysisExpectedVehicleEventIntervalSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

const EXPECTED_AVERAGE_VEHICLE_EVENT_INTERVAL = 20_000; // 20 seconds

/**
 * This analyzer tests if the average interval between vehicle events is within limits.
 *
 * GRADES:
 * → PASS = Average interval between Vehicle events is less than or equal to 20 seconds.
 * → FAIL = Average interval between Vehicle events is higher than 20 seconds.
 */
export function expectedVehicleEventIntervalAnalyzer(analysisData: AnalysisData): RideAnalysisExpectedVehicleEventInterval {
	try {
		//

		//
		// Return a fail grade if there are no vehicle events

		if (!analysisData.vehicle_events.length) {
			return RideAnalysisExpectedVehicleEventIntervalSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'skip',
				observed_average_interval: null,
				observed_max_interval: null,
				observed_min_interval: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_VEHICLE_EVENTS',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		//
		// Sort vehicle events by created_at timestamp

		const sortedVehicleEvents = analysisData.vehicle_events.sort((a, b) => a.created_at - b.created_at);

		//
		// Evaluate each vehicle event

		let totalIntervalBetweenEvents = 0;
		let maxIntervalBetweenEvents = 0;
		let minIntervalBetweenEvents = 0;

		let previousEventTimestamp = sortedVehicleEvents[0].created_at;

		for (let index = 1; index < sortedVehicleEvents.length; index++) {
			const delayInSeconds = sortedVehicleEvents[index].created_at - previousEventTimestamp;
			totalIntervalBetweenEvents += delayInSeconds;
			maxIntervalBetweenEvents = Math.max(maxIntervalBetweenEvents, delayInSeconds);
			minIntervalBetweenEvents = Math.min(minIntervalBetweenEvents, delayInSeconds);
			previousEventTimestamp = sortedVehicleEvents[index].created_at;
		}

		//
		// Calculate the average interval between vehicle events

		const avgIntervalBetweenEvents = totalIntervalBetweenEvents / analysisData.vehicle_events.length;

		if (avgIntervalBetweenEvents <= EXPECTED_AVERAGE_VEHICLE_EVENT_INTERVAL) {
			return RideAnalysisExpectedVehicleEventIntervalSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'pass',
				observed_average_interval: avgIntervalBetweenEvents,
				observed_max_interval: maxIntervalBetweenEvents,
				observed_min_interval: minIntervalBetweenEvents,
				operational_date: analysisData.ride.operational_date,
				reason: 'EXPECTED_VEHICLE_EVENT_INTERVAL',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		return RideAnalysisExpectedVehicleEventIntervalSchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'fail',
			observed_average_interval: avgIntervalBetweenEvents,
			observed_max_interval: maxIntervalBetweenEvents,
			observed_min_interval: minIntervalBetweenEvents,
			operational_date: analysisData.ride.operational_date,
			reason: 'UNEXPECTED_VEHICLE_EVENT_INTERVAL',
			remarks: null,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
		});

		//
	} catch (error) {
		return RideAnalysisExpectedVehicleEventIntervalSchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'error',
			observed_average_interval: null,
			observed_max_interval: null,
			observed_min_interval: null,
			operational_date: analysisData.ride.operational_date,
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
		});
	}
};
