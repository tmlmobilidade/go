/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type RideAnalysisExpectedStartTime, RideAnalysisExpectedStartTimeSchema } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * This analyzer tests if there is an excess delay starting the trip using geographic data.
 * It uses the timestamp of the first event that is outside the geofence
 * of the first stop of the trip to determine the trip start time.
 *
 * GRADES:
 * → PASS = Ride start time delay is less than or equal to five minutes.
 * → FAIL = Ride start time delay is greater than five minutes.
 */
export function expectedStartTimeAnalyzer(analysisData: AnalysisData): RideAnalysisExpectedStartTime {
	try {
		//

		//
		// Validate that the test has the necessary data

		if (!analysisData.ride.start_time_scheduled) {
			return RideAnalysisExpectedStartTimeSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'skip',
				observed_start_time: null,
				observed_start_time_delta: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_START_TIME_SCHEDULED',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		if (!analysisData.vehicle_events.length) {
			return RideAnalysisExpectedStartTimeSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'skip',
				observed_start_time: null,
				observed_start_time_delta: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'NO_VEHICLE_EVENTS',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		if (!analysisData.ride.start_time_observed) {
			return RideAnalysisExpectedStartTimeSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'skip',
				observed_start_time: null,
				observed_start_time_delta: null,
				operational_date: analysisData.ride.operational_date,
				reason: 'UNKNOWN_START',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		//
		// Calculate the delay in minutes

		const delayInMinutes = (analysisData.ride.start_time_observed - analysisData.ride.start_time_scheduled) / 1000 / 60;

		//
		// Classify the delay

		if (delayInMinutes <= -1) {
			return RideAnalysisExpectedStartTimeSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'fail',
				observed_start_time: analysisData.ride.start_time_observed,
				observed_start_time_delta: delayInMinutes,
				operational_date: analysisData.ride.operational_date,
				reason: 'EARLY_START',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		if (delayInMinutes > -1 && delayInMinutes <= 5) {
			return RideAnalysisExpectedStartTimeSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'pass',
				observed_start_time: analysisData.ride.start_time_observed,
				observed_start_time_delta: delayInMinutes,
				operational_date: analysisData.ride.operational_date,
				reason: 'START_ON_TIME',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		if (delayInMinutes > 5) {
			return RideAnalysisExpectedStartTimeSchema.parse({
				agency_id: analysisData.ride.agency_id,
				grade_status: 'fail',
				observed_start_time: analysisData.ride.start_time_observed,
				observed_start_time_delta: delayInMinutes,
				operational_date: analysisData.ride.operational_date,
				reason: 'LATE_START',
				remarks: null,
				ride_id: analysisData.ride._id,
				updated_at: Dates.now('utc').unix_timestamp,
			});
		}

		throw new Error(`Unexpected delay in minutes: ${delayInMinutes}`);

		//
	} catch (error) {
		return RideAnalysisExpectedStartTimeSchema.parse({
			agency_id: analysisData.ride.agency_id,
			grade_status: 'error',
			observed_start_time: null,
			observed_start_time_delta: null,
			operational_date: analysisData.ride.operational_date,
			reason: null,
			remarks: error.message,
			ride_id: analysisData.ride._id,
			updated_at: Dates.now('utc').unix_timestamp,
		});
	}
};
