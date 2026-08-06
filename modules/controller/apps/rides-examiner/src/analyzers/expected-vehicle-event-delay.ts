/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { Dates } from '@tmlmobilidade/dates';
import { type RideAnalysisExpectedVehicleEventDelay, RideAnalysisExpectedVehicleEventDelaySchema } from '@tmlmobilidade/go-types-operation';

/* * */

const MAX_DELAY_IN_MILLISECONDS = 10_000; // 10 seconds

/**
 * This analyzer tests if there are events with excessive delay between the vehicle and PCGI.
 *
 * GRADES:
 * → PASS = Delay between Vehicle and PCGI timestamps is less than 10 seconds.
 * → FAIL = Delay between Vehicle and PCGI timestamps is equal to or higher than 10 seconds.
 */
export function expectedVehicleEventDelayAnalyzer(analysisData: AnalysisData): RideAnalysisExpectedVehicleEventDelay {
	try {
		//

		if (!analysisData.vehicle_events.length) {
			return RideAnalysisExpectedVehicleEventDelaySchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'skip',
				observed_average_delay: null,
				observed_max_delay: null,
				observed_min_delay: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_VEHICLE_EVENTS',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
				vehicle_events_qty: null,
				vehicle_events_with_delay_percent: null,
				vehicle_events_with_delay_qty: null,
			});
		}

		//
		// Evaluate each vehicle event

		let countOfEventsWithDelay = 0;
		let totalDelay = 0;
		let minDelay = Infinity;
		let maxDelay = -Infinity;

		for (const vehicleEvent of analysisData.vehicle_events) {
			const delayInMilliseconds = vehicleEvent.received_at - vehicleEvent.created_at;
			totalDelay += delayInMilliseconds;
			minDelay = Math.min(minDelay, delayInMilliseconds);
			maxDelay = Math.max(maxDelay, delayInMilliseconds);
			if (delayInMilliseconds >= MAX_DELAY_IN_MILLISECONDS) countOfEventsWithDelay++;
		}

		//
		// Calculate delay metrics

		const averageDelay = totalDelay / analysisData.vehicle_events.length;
		const delayPercentage = (countOfEventsWithDelay / analysisData.vehicle_events.length) * 100;

		//
		// Return the result

		if (countOfEventsWithDelay > 0) {
			return RideAnalysisExpectedVehicleEventDelaySchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'fail',
				observed_average_delay: averageDelay,
				observed_max_delay: maxDelay,
				observed_min_delay: minDelay,
				operational_date: analysisData.ride.operational_date,
				reason: 'UNEXPECTED_VEHICLE_EVENTS_DELAY',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
				vehicle_events_qty: analysisData.vehicle_events.length,
				vehicle_events_with_delay_percent: delayPercentage,
				vehicle_events_with_delay_qty: countOfEventsWithDelay,
			});
		}

		return RideAnalysisExpectedVehicleEventDelaySchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'pass',
			observed_average_delay: averageDelay,
			observed_max_delay: maxDelay,
			observed_min_delay: minDelay,
			operational_date: analysisData.ride.operational_date,
			reason: 'EXPECTED_VEHICLE_EVENTS_DELAY',
			remarks: null,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
			vehicle_events_qty: analysisData.vehicle_events.length,
			vehicle_events_with_delay_percent: delayPercentage,
			vehicle_events_with_delay_qty: countOfEventsWithDelay,
		});

		//
	} catch (error) {
		return RideAnalysisExpectedVehicleEventDelaySchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'error',
			observed_average_delay: null,
			observed_max_delay: null,
			observed_min_delay: null,
			operational_date: analysisData.ride.operational_date,
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
			vehicle_events_qty: null,
			vehicle_events_with_delay_percent: null,
			vehicle_events_with_delay_qty: null,
		});
	}
};
